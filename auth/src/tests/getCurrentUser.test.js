const { getCurrentUser } = require("../controllers/auth.controller");

describe("getCurrentUser", () => {
  it("should return current user", async () => {
    const req = { user: { id: "u1", email: "x@y.com" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ user: req.user })
    );
  });
});
