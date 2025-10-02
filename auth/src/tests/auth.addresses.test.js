const { getUserAddresses, addUserAddresses, deleteUserAddresses } = require('../controllers/auth.controller');
const userModel = require('../models/user.model');

beforeEach(() => {
  // reset mocks
  if (userModel.findById && userModel.findById.mockReset) userModel.findById.mockReset();
  if (userModel.findByIdAndUpdate && userModel.findByIdAndUpdate.mockReset) userModel.findByIdAndUpdate.mockReset();
});

/////////////////////////
// getUserAddresses tests
/////////////////////////

test('returns 401 when no user id on request', async () => {
  const req = { user: null };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  await getUserAddresses(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
});

test('returns 404 when user not found', async () => {
  userModel.findById = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue(null)
  });

  const req = { user: { id: 'someuserid' } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  await getUserAddresses(req, res);

  expect(userModel.findById).toHaveBeenCalledWith('someuserid');
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
});

test('returns 200 and lists saved addresses with default marked', async () => {
  const addresses = [
    { name: "Home", street: "123 Main St", city: "Townsville", state: "TS", zip: "12345", phone: "555-0100", country: "CountryA", default: true },
    { name: "Office", street: "456 Work Rd", city: "Business City", state: "BC", zip: "67890", phone: "555-0200", country: "CountryB", default: false }
  ];

  userModel.findById = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ addresses })
  });

  const req = { user: { id: 'user123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await getUserAddresses(req, res);

  expect(userModel.findById).toHaveBeenCalledWith('user123');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: "Addresses fetched successfully.", addresses });

  const returned = res.json.mock.calls[0][0].addresses;
  expect(returned.find(a => a.name === "Home").default).toBe(true);
  expect(returned.find(a => a.name === "Office").default).toBe(false);
});

/////////////////////////
// addUserAddresses tests
/////////////////////////

test('addUserAddresses pushes address and returns the newly added address', async () => {
  const newAddress = { name: "Home", street: "123 Main St", city: "Townsville", state: "TS", zip: "12345", phone: "555-0100", country: "CountryA" };

  userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
    addresses: [{ name: "Old", street: "1 Old St" }, newAddress]
  });

  const req = { user: { id: 'user123' }, body: { ...newAddress } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await addUserAddresses(req, res);

  expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
    'user123',
    expect.objectContaining({ $push: { addresses: expect.objectContaining(newAddress) } }),
    { new: true }
  );

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: "Address added successfully.", addresses: newAddress });
});

/////////////////////////
// deleteUserAddresses tests
/////////////////////////

test('deleteUserAddresses returns 400 if invalid addressId', async () => {
  const req = { user: { id: 'user123' }, params: { addressId: 'invalid-id' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await deleteUserAddresses(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ message: "Invalid address ID" });
});

test('deleteUserAddresses returns 404 if user not found', async () => {
  userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

  const req = { user: { id: 'user123' }, params: { addressId: '64f5a1b2c3d4e5f67890abcd' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await deleteUserAddresses(req, res);

  expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
});

test('deleteUserAddresses removes address and returns updated addresses', async () => {
  const remainingAddresses = [{ name: "Office", street: "456 Work Rd" }];
  userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ addresses: remainingAddresses });

  const req = { user: { id: 'user123' }, params: { addressId: '64f5a1b2c3d4e5f67890abcd' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await deleteUserAddresses(req, res);

  expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
    'user123',
    { $pull: { addresses: { _id: '64f5a1b2c3d4e5f67890abcd' } } },
    { new: true }
  );

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: "Address deleted successfully", addresses: remainingAddresses });
});
