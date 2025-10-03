const Product = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;

    if (!title || !priceAmount) return res.status(400).json({ message: "Title, priceAmount, are required" });

    if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'At least one image is required' });
}

    const seller = req.user.id;

    const price = { amount: Number(priceAmount), currency: priceCurrency };
    const images = await Promise.all(req.files.map(file => uploadImage({ buffer: file.buffer })));

    const product = await Product.create({
      title,
      description,
      price,
      seller,
      Images: images,
    });
    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getProducts(req, res) {
   try {
    let { q, minPrice, maxPrice, skip = 0, limit = 20, } = req.query;

    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20));

    return res.status(200).json({
      products: products
   });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getProductsById(req, res) {
  const { id } = req.params;

  const product = await Product.findById(id)

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.status(200).json({ product: product });
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priceAmount, priceCurrency } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Insure user is the owner
    const sellerId =
      typeof product.seller === 'object' && product.seller._id
        ? product.seller._id.toString()
        : product.seller.toString();

    if (sellerId !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }


     if (title) product.title = title;
    if (description) product.description = description;

    // ✅ Update nested price
    if (priceAmount || priceCurrency) {
      if (!product.price) product.price = {};
      if (priceAmount) product.price.amount = priceAmount;
      if (priceCurrency) product.price.currency = priceCurrency;
    }

    // ✅ Update Images (if new images are uploaded)
    if (req.files && req.files.length > 0) {
      // Upload new images just like createProduct
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadImage(file))
      );

      product.Images = uploadedImages.map((img) => ({
        url: img.url,
        thumbnail: img.thumbnail,
        id: img.fileId,
      }));
    }


    await product.save();

    return res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Ensure comparison is string-to-string
    const sellerId = product.seller?._id?.toString() || product.seller.toString();

    if (sellerId !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}


module.exports = { createProduct, getProducts, getProductsById, updateProduct, deleteProduct };
