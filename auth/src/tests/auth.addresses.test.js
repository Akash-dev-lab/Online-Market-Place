const { getUserAddresses, addUserAddresses } = require('../controllers/auth.controller');

// Mock the user model before importing the controller in real projects.
// Here controller already imported above; we directly replace methods on the actual module.
const userModel = require('../models/user.model');

beforeEach(() => {
	// reset any mocks we attach to the model
	if (userModel.findById && userModel.findById.mockReset) userModel.findById.mockReset();
	if (userModel.findByIdAndUpdate && userModel.findByIdAndUpdate.mockReset) userModel.findByIdAndUpdate.mockReset();
});

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
	// make findById(...).select(...) resolve to null
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
		{
			name: "Home",
			street: "123 Main St",
			city: "Townsville",
			state: "TS",
			zip: "12345",
			phone: "555-0100",
			country: "CountryA",
			default: true
		},
		{
			name: "Office",
			street: "456 Work Rd",
			city: "Business City",
			state: "BC",
			zip: "67890",
			phone: "555-0200",
			country: "CountryB",
			default: false
		}
	];

	userModel.findById = jest.fn().mockReturnValue({
		select: jest.fn().mockResolvedValue({ addresses })
	});

	const req = { user: { id: 'user123' } };
	const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	};

	await getUserAddresses(req, res);

	expect(userModel.findById).toHaveBeenCalledWith('user123');
	expect(res.status).toHaveBeenCalledWith(200);
	expect(res.json).toHaveBeenCalledWith({
		message: "Addresses fetched successfully.",
		addresses: addresses
	});

	// ensure default marking is preserved in the returned payload
	const returned = res.json.mock.calls[0][0].addresses;
	expect(returned.find(a => a.name === "Home").default).toBe(true);
	expect(returned.find(a => a.name === "Office").default).toBe(false);
});

// New test for addUserAddresses (controller pushes the address and returns the newly added address)
test('addUserAddresses pushes address and returns the newly added address', async () => {
	const newAddress = {
		name: "Home",
		street: "123 Main St",
		city: "Townsville",
		state: "TS",
		zip: "12345",
		phone: "555-0100",
		country: "CountryA"
	};

	// simulate updated user returned from findByIdAndUpdate (existing addresses + new one)
	userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
		addresses: [
			{ name: "Old", street: "1 Old St" },
			newAddress
		]
	});

	const req = { user: { id: 'user123' }, body: { ...newAddress } };
	const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	};

	await addUserAddresses(req, res);

	expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
		'user123',
		expect.objectContaining({
			$push: {
				addresses: expect.objectContaining(newAddress)
			}
		}),
		{ new: true }
	);

	expect(res.status).toHaveBeenCalledWith(200);
	expect(res.json).toHaveBeenCalledWith({
		message: "Address added successfully.",
		addresses: newAddress
	});
});