const Product = require('../models/product.model');
const { getProducts } = require('../controllers/product.controller');

jest.mock('../services/imagekit.service.js', () => ({
  uploadImage: jest.fn(),
  imagekit: {}
}));

jest.mock("../models/product.model.js");

describe("getProducts Controller", () => {
  it("should return products with filters and pagination", async () => {
    const req = {
      query: {
        q: "phone",
        minPrice: "100",
        maxPrice: "1000",
        skip: "0",
        limit: "5",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const products = [
      { name: "Phone 1", price: { amount: 200 } },
      { name: "Phone 2", price: { amount: 500 } },
    ];

    // chainable query mock
    const mockQuery = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(products),
    };

    Product.find.mockReturnValue(mockQuery);

    await getProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({
      $text: { $search: "phone" },
      "price.amount": { $gte: 100, $lte: 1000 },
    });

    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(5);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ products });
  });

  it("should handle server errors", async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});