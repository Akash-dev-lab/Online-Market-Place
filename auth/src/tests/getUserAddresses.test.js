const { getUserAddresses } = require("../controllers/auth.controller");
const userModel = require("../models/user.model");

jest.mock("../models/user.model");

describe("getUserAddresses", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "uid1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return addresses successfully", async () => {
    userModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ addresses: [] }) });
    await getUserAddresses(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if user not found", async () => {
    userModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await getUserAddresses(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 401 if no user id", async () => {
    req.user = null;
    await getUserAddresses(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
