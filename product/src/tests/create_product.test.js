const { createProduct } = require('../controllers/product.controller');
const Product = require('../models/product.model');
const { uploadImage } = require('../services/imagekit.service');

// Correctly mock modules
jest.mock('../models/product.model');
jest.mock('../services/imagekit.service', () => ({
  uploadImage: jest.fn()
}));

describe('createProduct Controller', () => {

  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user123' },
      body: {
        title: 'Test Product',
        description: 'Test Description',
        priceAmount: 1000,
        priceCurrency: 'INR'
      },
      files: [
        { buffer: Buffer.from('image1') },
        { buffer: Buffer.from('image2') }
      ]
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if title or priceAmount is missing', async () => {
    req.body.title = '';
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Title, priceAmount, are required' });
  });

  test('should return 400 if no images provided', async () => {
    req.files = [];
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'At least one image is required' });
  });

  test('should create product successfully', async () => {
    // Mock uploadImage to return URLs
    uploadImage.mockImplementation(async (file) => ({
      url: `https://ik.imagekit.io/test/${file.buffer.toString()}.jpg`,
      thumbnail: `https://ik.imagekit.io/test/${file.buffer.toString()}.jpg`,
      fileId: `file_${file.buffer.toString()}`
    }));

    // Mock Product.create
    Product.create.mockResolvedValue({
      title: req.body.title,
      description: req.body.description,
      price: { amount: req.body.priceAmount, currency: req.body.priceCurrency },
      seller: req.user.id,
      Images: [
        { url: 'https://ik.imagekit.io/test/image1.jpg', thumbnail: 'https://ik.imagekit.io/test/image1.jpg', id: 'file_image1' },
        { url: 'https://ik.imagekit.io/test/image2.jpg', thumbnail: 'https://ik.imagekit.io/test/image2.jpg', id: 'file_image2' }
      ],
      _id: 'product123'
    });

    await createProduct(req, res);

    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(Product.create).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product created successfully',
      product: expect.objectContaining({
        title: 'Test Product',
        Images: expect.any(Array)
      })
    });
  });

});
