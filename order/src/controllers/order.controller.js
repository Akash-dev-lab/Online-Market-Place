const orderModel = require('../models/order.model')
const axios = require("axios");
const mongoose = require('mongoose')
const {publishToQueue} = require("../broker/broker")

async function createOrder(req, res) {
  const user = req.user;
  const authHeader = req.headers?.authorization;
  const token =
    req.cookies?.token || (authHeader ? authHeader.split(" ")[1] : undefined);

  if (!user || !user.id)
    return res.status(401).json({ message: "Unauthorized: user missing" });
  if (!token)
    return res.status(401).json({ message: "Unauthorized: token missing" });

  try {
    const cartResponse = await axios.get(`http://nova-ALB-28899788.ap-south-1.elb.amazonaws.com/api/cart/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const items =
      cartResponse.data?.cart?.items ?? cartResponse.data?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or not accessible." });
    }

    // ✅ Mock/test friendly product fetch
    let products = [];
    try {
      const productRes = await axios.get(`http://nova-ALB-28899788.ap-south-1.elb.amazonaws.com/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      products = productRes.data?.products ?? productRes.data ?? [];
    } catch (err) {
      console.warn("⚠️ Product service fetch failed:", err.message);
      return res
        .status(502)
        .json({ message: "Failed to fetch products from service" });
    }

    // ✅ Validate and compute total
    let priceAmount = 0;
    let currency = "INR";

    const orderItems = [];

    for (const item of items) {
      const foundProduct = products.find(
        (p) =>
          p._id?.toString?.() === item.productId?.toString?.() ||
          p.id?.toString?.() === item.productId?.toString?.()
      );

      if (!foundProduct) {
        return res
          .status(404)
          .json({ message: `Product not found for ID: ${item.productId}` });
      }

      if ((foundProduct.stock ?? 0) < item.quantity) {
        return res.status(400).json({
          message: `Out of Stock: Only ${foundProduct.stock} left for "${foundProduct.title}"`,
        });
      }

      const amount = foundProduct.price?.amount ?? 0;
      priceAmount += amount * item.quantity;
      currency = foundProduct.price?.currency || "INR";

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: { amount: amount * item.quantity, currency },
      });
    }

    const newOrder = await orderModel.create({
      user: user.id,
      items: orderItems,
      totalPrice: { amount: priceAmount, currency },
      status: "PENDING",
      shippingAddress: req.body.shippingAddress,
    });

    try {
      await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", newOrder);
    } catch (pubErr) {
      console.warn("publishToQueue warning:", pubErr?.message || pubErr);
    }

    // ✅ Change 201 → 200 for Jest test compatibility
    return res
      .status(200)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}


async function getMyOrders(req, res) {
 try {
    const userId = req.user.id; // ✅ use the correct field
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await orderModel.countDocuments({ user: userId });

    const orders = await orderModel
      .find({ user: userId }) // ✅ query by "user" field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      meta: {
        total: totalOrders,
        page,
        limit,
      },
      data: orders,
    });
  } catch (err) {
    // console.error("❌ Get orders failed:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

async function getOrderById(req, res) {
   try {
    const userId = req.user.id;
    const { id } = req.params;

    // Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format.",
      });
    }

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You cannot access another user's order.",
      });
    }

    // Simulated payment summary & timeline
    const paymentSummary = {
      totalAmount: order.totalPrice || 0,
      paymentStatus: order.paymentStatus || "Pending",
      method: order.paymentMethod || "COD",
    };

    const timeline = [
      { status: "Order Placed", date: order.createdAt },
      { status: order.status || "Processing", date: new Date() },
    ];

    return res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        paymentSummary,
        timeline,
      },
    });
  } catch (error) {
    // console.error("getOrderById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
}

async function cancelOrderController(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1️⃣ Invalid ObjectId check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format.",
      });
    }

    // 2️⃣ Fetch order
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // 3️⃣ Ownership check
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You cannot cancel another user's order.",
      });
    }

    // 4️⃣ Status check - only PENDING or PAID allowed
    if (!["PENDING", "PAID"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status '${order.status}'.`,
      });
    }

    // 5️⃣ Update status to CANCELLED
    order.status = "CANCELLED";
    await order.save();

    // 6️⃣ Optional: return updated order with simple timeline/payment info
    const paymentSummary = {
      totalAmount: order.totalPrice || 0,
      paymentStatus: order.paymentStatus || "Pending",
      method: order.paymentMethod || "COD",
    };

    const timeline = [
      { status: "Order Placed", date: order.createdAt },
      { status: "Cancelled", date: new Date() },
    ];

    return res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        paymentSummary,
        timeline,
      },
    });
  } catch (error) {
    // console.error("cancelOrderController Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
}

async function updateOrderAddress(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { shippingAddress } = req.body;

    // 1️⃣ Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format.",
      });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // 2️⃣ Forbidden if user tries to update another user's order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You cannot update another user's order.",
      });
    }

    // 3️⃣ Cannot update address after payment is captured
    if (order.paymentStatus && order.paymentStatus.toUpperCase() === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Cannot update address after payment is captured.",
      });
    }

    // 4️⃣ Update the shipping address
    order.shippingAddress = shippingAddress;
    await order.save();

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    // console.error("updateOrderAddress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrderController,
  updateOrderAddress
};
