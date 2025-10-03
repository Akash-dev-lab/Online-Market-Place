const Product = require("../models/product.model");
const { updateProduct } = require("../controllers/product.controller");

jest.mock("../models/product.model");

jest.mock('../services/imagekit.service.js', () => ({
  uploadImage: jest.fn(),
  imagekit: {}
}));

describe("updateProduct Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "123" },
      body: { title: "Updated Phone", description: "New Description" },
      user: { id: "seller123", role: "seller" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 404 if product not found", async () => {
    Product.findById.mockResolvedValue(null);

    await updateProduct(req, res);

    expect(Product.findById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
  });

  it("should return 403 if user is not the owner", async () => {
    const fakeProduct = { _id: "123", seller: "otherSeller" };
    Product.findById.mockResolvedValue(fakeProduct);

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized to update this product" });
  });

  it("should update product successfully", async () => {
    const fakeProduct = {
      _id: "123",
      seller: "seller123",
      title: "Old Phone",
      description: "Old Description",
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findById.mockResolvedValue(fakeProduct);

    await updateProduct(req, res);

    expect(fakeProduct.title).toBe("Updated Phone");
    expect(fakeProduct.description).toBe("New Description");
    expect(fakeProduct.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Product updated successfully", product: fakeProduct });
  });

  it("should handle server errors", async () => {
    Product.findById.mockRejectedValue(new Error("Database error"));

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
