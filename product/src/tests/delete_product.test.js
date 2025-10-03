const { deleteProduct } = require('../controllers/product.controller');
const Product = require('../models/product.model');

jest.mock('../models/product.model');

jest.mock('../services/imagekit.service.js', () => ({
  uploadImage: jest.fn(),
  imagekit: {}
}));

describe('deleteProduct Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 'product123' },
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

  test('should return 404 if product not found', async () => {
    Product.findById.mockResolvedValue(null);

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  test('should return 403 if user is not the owner', async () => {
    Product.findById.mockResolvedValue({
      _id: 'product123',
      seller: 'otherUser'
    });

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this product' });
  });

  test('should delete product successfully', async () => {
    Product.findById.mockResolvedValue({
      _id: 'product123',
      seller: 'user123'
    });
    Product.findByIdAndDelete.mockResolvedValue({}); // simulate deletion

    await deleteProduct(req, res);

    expect(Product.findByIdAndDelete).toHaveBeenCalledWith('product123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
  });

  test('should handle server errors', async () => {
    const errorMessage = 'Database error';
    Product.findById.mockRejectedValue(new Error(errorMessage));

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});
