const orderModel = require("../models/order.model");
const paymentModel = require("../models/payment.model");
const productModel = require("../models/product.model");

/**
 * 📊 GET /api/seller/dashboard
 * Returns Seller Analytics: total sales, total revenue, and top-selling products.
 */
async function getSellerMetrics(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized: Seller ID missing" });
    }

    // 🧮 1️⃣ Get all products by this seller
    const products = await productModel.find({ seller: sellerId }).select("_id title price");

    if (!products.length) {
      return res.status(200).json({
        sales: 0,
        revenue: 0,
        topProducts: [],
        message: "No products found for this seller",
      });
    }

    const productIds = products.map((p) => p._id.toString());

    // 🧾 2️⃣ Get all orders containing seller’s products
    const orders = await orderModel.find({
      "items.product": { $in: productIds },
      status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] }, // filter successful orders
    });

    if (!orders.length) {
      return res.status(200).json({
        sales: 0,
        revenue: 0,
        topProducts: [],
        message: "No orders yet for this seller",
      });
    }

    // 💰 3️⃣ Aggregate sales + revenue + top products
    let totalSales = 0;
    let totalRevenue = 0;
    const productSales = {};

    for (const order of orders) {
      for (const item of order.items) {
        const prodId = item.product.toString();
        if (productIds.includes(prodId)) {
          totalSales += item.quantity;
          totalRevenue += item.price.amount;

          if (!productSales[prodId]) {
            const found = products.find((p) => p._id.toString() === prodId);
            productSales[prodId] = {
              title: found?.title || "Unknown Product",
              revenue: 0,
              quantity: 0,
            };
          }

          productSales[prodId].quantity += item.quantity;
          productSales[prodId].revenue += item.price.amount;
        }
      }
    }

    // 🔝 4️⃣ Sort top products by revenue or quantity
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 📦 5️⃣ Send response
    return res.status(200).json({
      sales: totalSales,
      revenue: totalRevenue,
      topProducts,
    });
  } catch (error) {
    console.error("❌ Error fetching seller dashboard:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized: Seller ID missing" });
    }

    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const statusFilter = req.query.status; // optional: PENDING, SHIPPED, DELIVERED, COMPLETED

    // 1) Find all product IDs owned by this seller
    const products = await productModel.find({ seller: sellerId }).select("_id").lean();
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(200).json({
        page,
        limit,
        total: 0,
        orders: [],
        message: "No products found for this seller",
      });
    }

    // 2) Build order query: orders that contain any of these product IDs
    const q = { "items.product": { $in: productIds } };
    if (statusFilter) q.status = statusFilter;

    const [orders, total] = await Promise.all([
      orderModel
        .find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      orderModel.countDocuments(q)
    ]);

    // 3) For each order, keep only this seller's items and compute seller total
    const shaped = orders.map(o => {
      const sellerItems = (o.items || []).filter(it =>
        productIds.some(id => id.toString() === it.product.toString())
      );

      const sellerAmount = sellerItems.reduce(
        (sum, it) => sum + (it.price?.amount || 0),
        0
      );

      return {
        _id: o._id,
        user: o.user,                // buyer id
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        items: sellerItems,          // only seller-owned items
        totalForSeller: {
          amount: sellerAmount,
          currency: (o.totalPrice && o.totalPrice.currency) || "INR",
        },
        // optional: include full shipping address if you want
        shippingAddress: o.shippingAddress,
      };
    });

    return res.status(200).json({
      page,
      limit,
      total,
      orders: shaped,
    });
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error.message || error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts(req, res) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized: Seller ID missing" });
    }

    // Pagination & filters
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = req.query.search?.trim() || "";
    const minStock = parseInt(req.query.minStock) || 0;
    const maxStock = req.query.maxStock ? parseInt(req.query.maxStock) : null;

    // Build query dynamically
    const q = { seller: sellerId };
    if (search) q.title = { $regex: search, $options: "i" };
    if (minStock || maxStock) {
      q.stock = {};
      if (minStock) q.stock.$gte = minStock;
      if (maxStock) q.stock.$lte = maxStock;
    }

    // Fetch products
    const [products, total] = await Promise.all([
      productModel
        .find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title description price stock Images createdAt updatedAt")
        .lean(),
      productModel.countDocuments(q),
    ]);

    // Response
    return res.status(200).json({
      page,
      limit,
      total,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching seller products:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


module.exports = {
  getSellerMetrics,
  getOrders,
  getProducts,
};
