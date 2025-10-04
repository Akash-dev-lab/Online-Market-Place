const cartModel = require('../models/cart.model');

async function addItemToCart(req, res) {
    const {productId, qty} = req.body;
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
    let cart = await cartModel.findOne({user: userId});
    if (!cart) {
        cart = new cartModel({user: userId, items: []});
    }

    const existingItemIndex = cart.items.findIndex(item => item.product === productId);
    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += qty;
    } else {
        cart.items.push({productId: productId, quantity: qty});
    }

    await cart.save();
    res.status(200).json({message: 'Item added to cart', cart});
}

async function getCart(req, res) {
    const user = req.user.id;

    let cart = await cartModel.findOne({user: user});

    if (!cart) {
        cart = new cartModel({user: user, items: []});
        await cart.save();
    }

    res.status(200).json({
        cart,
        totals: {
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity,)
        }
    });
}

module.exports = { addItemToCart, getCart };