const userModel = require("../models/user.model")
const productModel = require("../models/product.model")
const {subscribeToQueue} = require("./broker")

module.exports = async function () {
    subscribeToQueue('AUTH_SELLER_DASHBOARD.USER_CREATED', async (user) => {
        await userModel.create(user)
    })

    subscribeToQueue('PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED', async (product) => {
        await productModel.create(product)
    })
}