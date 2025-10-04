// cart.controller.test.js
const { addItemToCart } = require('../controllers/cart.controller');
const cartModel = require('../models/cart.model');

jest.mock('../models/cart.model');

describe('addItemToCart controller', () => {
    let req, res, saveMock;

    beforeEach(() => {
        saveMock = jest.fn().mockResolvedValue(true);

        req = {
            body: {},
            user: { id: 'user123' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if productId is missing', async () => {
        req.body = { qty: 2 };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product ID is required' });
    });

    test('should return 400 if qty is missing', async () => {
        req.body = { productId: 'prod123' };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Quantity is required' });
    });

    test('should return 400 if qty is <= 0', async () => {
        req.body = { productId: 'prod123', qty: 0 };
        await addItemToCart(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Quantity must be greater than 0' });
    });

    test('should create new cart if none exists and add item', async () => {
        req.body = { productId: 'prod123', qty: 2 };

        cartModel.findOne.mockResolvedValue(null);
        cartModel.mockImplementation(() => ({
            items: [],
            save: saveMock
        }));

        await addItemToCart(req, res);

        expect(cartModel).toHaveBeenCalledWith({ user: 'user123', items: [] });
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Item added to cart',
            cart: expect.objectContaining({ items: [{ productId: 'prod123', quantity: 2 }] })
        }));
    });

    test('should increment quantity if item already exists', async () => {
        req.body = { productId: 'prod123', qty: 3 };

        const cartInstance = {
            items: [{ product: 'prod123', quantity: 2 }],
            save: saveMock
        };

        cartModel.findOne.mockResolvedValue(cartInstance);

        await addItemToCart(req, res);

        expect(cartInstance.items[0].quantity).toBe(5);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Item added to cart',
            cart: cartInstance
        }));
    });
});
