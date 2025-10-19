const { createProduct } = require("../controllers/product.controller");
const Product = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

jest.mock("../models/product.model.js");

jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "mock-url",
    fileId: "mock-file-id",
    thumbnail: "mock-thumb"
  })
}));

describe("createProduct Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        title: "Test Product",
        description: "desc",
        priceAmount: 100,
        priceCurrency: "INR",
        stock: 5
      },
      user: { id: "seller123" },
      files: [{ buffer: Buffer.from("fake") }]
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    uploadImage.mockResolvedValue({ url: "mock-url", fileId: "img123" });
    Product.create.mockResolvedValue({ _id: "1", title: "Test Product" });
  });

  afterAll(() => jest.clearAllMocks());

  it("should create product successfully", async () => {
    await createProduct(req, res);
    expect(Product.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 if title missing", async () => {
    req.body.title = "";
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should handle server error", async () => {
    Product.create.mockRejectedValueOnce(new Error("fail"));
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
