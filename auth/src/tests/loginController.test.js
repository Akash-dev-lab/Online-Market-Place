const { loginController } = require("../controllers/auth.controller");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/user.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: "test@example.com", password: "123456" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
  });

  it("should login successfully", async () => {
    const user = {
      _id: "uid",
      username: { firstName: "John" },
      email: "test@example.com",
      role: "user",
      password: "hashed",
    };

    userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 400 if missing fields", async () => {
    req.body = {};
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 401 if invalid credentials", async () => {
    userModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
