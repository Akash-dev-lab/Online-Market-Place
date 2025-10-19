const { getSellerProducts } = require("../controllers/product.controller");
const Product = require("../models/product.model");

jest.mock("../models/product.model");

describe("getSellerProducts Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "seller123" }, query: { skip: 0, limit: 5 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return seller products", async () => {
    const execMock = jest.fn().mockResolvedValue([{ _id: "1" }]);
    Product.find.mockReturnValue({ skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), exec: execMock });

    await getSellerProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle server error", async () => {
    Product.find.mockImplementation(() => { throw new Error("fail"); });
    await getSellerProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
