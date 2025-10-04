const { addItemToCart } = require('../controllers/cart.controller');
const cartModel = require('../models/cart.model');

// Mock Response Object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock cartModel
jest.mock('../models/cart.model');

describe("addItemToCart Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { id: "user123" }
        };
        res = mockResponse();
        cartModel.findOne.mockClear();
    });

    test("should return 400 if productId is missing", async () => {
        req.body = { qty: 2 };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Product ID is required" });
    });

    test("should return 400 if qty is missing", async () => {
        req.body = { productId: "prod123" };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Quantity is required" });
    });

    test("should return 400 if qty is <= 0", async () => {
        req.body = { productId: "prod123", qty: 0 };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Quantity must be greater than 0" });
    });

    test("should create new cart and add item if no cart exists", async () => {
        req.body = { productId: "prod123", qty: 2 };
        cartModel.findOne.mockResolvedValue(null);

        const mockSave = jest.fn().mockResolvedValue(true);
        cartModel.mockImplementation(() => ({ user: "user123", items: [], save: mockSave }));

        await addItemToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Item added to cart",
            cart: expect.any(Object)
        }));
    });

    test("should update qty if product already exists in cart", async () => {
        req.body = { productId: "prod123", qty: 2 };

        const mockCart = {
            user: "user123",
            items: [{ product: "prod123", quantity: 1 }],
            save: jest.fn().mockResolvedValue(true),
        };

        cartModel.findOne.mockResolvedValue(mockCart);

        await addItemToCart(req, res);

        expect(mockCart.items[0].quantity).toBe(3);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Item added to cart",
            cart: mockCart
        }));
    });
});
