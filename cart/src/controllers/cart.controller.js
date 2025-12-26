const cartModel = require('../models/cart.model');
const axios = require('axios')

async function addItemToCart(req, res) {
  const { productId, qty } = req.body;
  const userId = req.user.id;

  const validations = [
    { field: 'productId', condition: val => !val, message: 'Product ID is required' },
    { field: 'qty', condition: val => val === undefined, message: 'Quantity is required' },
    { field: 'qty', condition: val => val <= 0, message: 'Quantity must be greater than 0' },
  ];

  for (let { field, condition, message } of validations) {
    if (condition(req.body[field])) {
      return res.status(400).json({ message });
    }
  }

  // ✅ Product existence verification
  const productURL = `${process.env.PRODUCT_URL}/api/products/${productId}`;
  const productResponse = await axios.get(productURL).catch(() => null);

  if (!productResponse || productResponse.status !== 200) {
    return res.status(404).json({ message: 'Product not found in Product Service' });
  }

  const product = productResponse.data;

  let cart = await cartModel.findOne({ user: userId });
  if (!cart) {
    cart = new cartModel({ user: userId, items: [] });
  }

<<<<<<< HEAD
  const existingItemIndex = cart.items.findIndex(item => item.product === productId);
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += qty;
  } else {
    cart.items.push({ title: product.product.title, price: product.product.price, images: product.product.Images, productId: productId, quantity: qty });
  }
=======
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += qty;
    } else {
        cart.items.push({ title: product.product.title, price: product.product.price, images: product.product.Images, productId: productId, quantity: qty});
    }
>>>>>>> 10b4dcde3d767ee5e893fa7efc260fa7e8693ab7

  await cart.save();
  res.status(200).json({ message: 'Item added to cart', cart });
}

async function getCart(req, res) {
  const user = req.user.id;

  let cart = await cartModel.findOne({ user: user });
  if (!cart) return res.status(404).json({ message: 'Cart empty' });

  res.status(200).json({
    cart,
    totals: {
      itemCount: cart.items.length,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    }
  });
}

async function updateCartItem(req, res) {
  const { productId } = req.params;
  const { qty } = req.body;
  const user = req.user.id;

  const cart = await cartModel.findOne({ user: user });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() == productId);

  if (itemIndex < 0) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  cart.items[itemIndex].quantity = qty;
  await cart.save();

  res.status(200).json({ message: 'Cart item updated', cart });
}

async function deleteCartItem(req, res) {
  const { productId } = req.params;
  const user = req.user.id;

  const cart = await cartModel.findOne({ user: user });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex < 0) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  cart.items.splice(itemIndex, 1); // remove item
  await cart.save();

  res.status(200).json({ message: "Item removed from cart", cart });
}


async function clearCart(req, res) {
  const user = req.user.id;

  const cart = await cartModel.findOne({ user: user });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = []; // clear all items
  await cart.save();

  res.status(200).json({ message: "Cart cleared successfully", cart });
}


module.exports = { addItemToCart, getCart, updateCartItem, clearCart, deleteCartItem };