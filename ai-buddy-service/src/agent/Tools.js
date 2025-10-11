const {tool} = require('@langchain/core/tools')
const axios = require('axios')
const { z } = require('zod')


const searchProduct = tool(async ({query}, config) => {

    const token = config?.metadata?.token;
    console.log("🔑 Tool received token:", token);

    const response = await axios.get(`http://localhost:3001/api/products?q=${query}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return JSON.stringify(response.data)
},
{
    name: "searchProduct",
    description: "Search for products based on query",
    schema: z.object({
        query: z.string().describe("The search query for products")
    })
})

const addProductToCart = tool(async ({productId, qty = 1}, config) => {

    const token = config?.metadata?.token;
     console.log("🛒 Tool received token:", token);

    const response = await axios.post(`http://localhost:3002/api/cart/items`, {
        productId,
        qty
    },
        {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return `Added product with id ${productId} (qty: ${qty}) to cart`
}, {
    name: "addProductToCart",
    description: "Add a product to the shopping cart",
    schema: z.object({
        query: z.string().describe("The id of the product to add to the cart"),
        qty: z.number().describe("The quantity of the product to add to the cart").default(1),
    })
})

module.exports = {searchProduct, addProductToCart}