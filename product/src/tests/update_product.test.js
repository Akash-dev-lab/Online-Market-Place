const { updateProduct } = require("../controllers/product.controller");
const Product = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

jest.mock("../models/product.model");
jest.mock("../services/imagekit.service");

describe("updateProduct Controller", () => {
  let req, res, mockProduct;

  beforeEach(() => {
    req = {
      params: { id: "123" },
      body: { title: "Updated", priceAmount: 200 },
      user: { id: "seller123" },
      files: []
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    mockProduct = {
      seller: "seller123",
      price: { amount: 100, currency: "INR" },
      save: jest.fn().mockResolvedValue(true)
    };
  });

  afterAll(() => jest.clearAllMocks());

  it("should update product successfully", async () => {
    Product.findById.mockResolvedValue(mockProduct);
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 403 if user not owner", async () => {
    mockProduct.seller = "otherUser";
    Product.findById.mockResolvedValue(mockProduct);
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should return 404 if product not found", async () => {
    Product.findById.mockResolvedValue(null);
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
