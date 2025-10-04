const { getCart } = require('../controllers/cart.controller');
const cartModel = require('../models/cart.model');

jest.mock('../models/cart.model');

describe('getCart controller', () => {
    let req, res, saveMock;

    beforeEach(() => {
        saveMock = jest.fn().mockResolvedValue(true);

        req = { user: { id: 'user123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create new cart if none exists and return it', async () => {
        cartModel.findOne.mockResolvedValue(null);
        cartModel.mockImplementation(() => ({ user: req.user.id, items: [], save: saveMock }));

        await getCart(req, res);

        expect(cartModel.findOne).toHaveBeenCalledWith({ user: req.user.id });
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            cart: expect.objectContaining({ user: req.user.id, items: [] }),
            totals: { itemCount: 0 }
        }));
    });

    it('should return existing cart and compute itemCount', async () => {
        const mockCart = { user: req.user.id, items: [{ quantity: 2 }, { quantity: 3 }] };
        cartModel.findOne.mockResolvedValue(mockCart);

        await getCart(req, res);

        expect(cartModel.findOne).toHaveBeenCalledWith({ user: req.user.id });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            cart: mockCart,
            totals: { itemCount: 5 }
        });
    });
});
