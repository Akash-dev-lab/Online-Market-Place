const { getSellerProducts } = require('../controllers/product.controller');
const Product = require('../models/product.model');

jest.mock('../models/product.model');

jest.mock('../services/imagekit.service.js', () => ({
  uploadImage: jest.fn(),
  imagekit: {}
}));

describe('getSellerProducts Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'seller123' },
      query: { skip: '0', limit: '10' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return products for the seller', async () => {
    const mockProducts = [
      { _id: 'p1', title: 'Product 1', seller: 'seller123' },
      { _id: 'p2', title: 'Product 2', seller: 'seller123' }
    ];

    // Mock Product.find to return the products
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockProducts)
    });

    await getSellerProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({ seller: 'seller123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ products: mockProducts });
  });

  test('should return empty array if no products found', async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    });

    await getSellerProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ products: [] });
  });

  test('should handle server errors', async () => {
    const errorMessage = 'Database error';
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockRejectedValue(new Error(errorMessage))
    });

    await getSellerProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});
