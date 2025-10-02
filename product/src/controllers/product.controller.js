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

module.exports = { createProduct };
