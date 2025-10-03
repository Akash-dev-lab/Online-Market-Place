const { getProducts } = require('../controllers/product.controller');
const Product = require('../models/product.model');

jest.mock('../models/product.model');

jest.mock('../services/imagekit.service.js', () => ({
  uploadImage: jest.fn(),
  imagekit: {}
}));

describe('getProducts Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: { q: '', minPrice: '', maxPrice: '', skip: 0, limit: 5 }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return products with filters and pagination', async () => {
    const mockProducts = [
      { title: 'Phone 1', price: { amount: 200 } },
      { title: 'Phone 2', price: { amount: 500 } }
    ];

    // Chainable mocks: find -> skip -> limit
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);
    const mockSkip = jest.fn(() => ({ limit: mockLimit }));
    Product.find.mockReturnValue({ skip: mockSkip });

    await getProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({});
    expect(mockSkip).toHaveBeenCalledWith(0);
    expect(mockLimit).toHaveBeenCalledWith(5);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      products: mockProducts
    });
  });

  test('should handle server errors', async () => {
    Product.find.mockImplementation(() => {
      throw new Error('Database error');
    });

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});
