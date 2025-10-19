// setup.js — pure isolation test setup (no MongoDB)

// ✅ Partial mock to keep mongoose.Schema usable, but disable real connections
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(),
    connection: { close: jest.fn() }
  };
});

// ✅ Set fake environment variables for ImageKit etc.
process.env.JWT_SECRET = "test_secret";
process.env.IMAGEKIT_PUBLIC_KEY = "fake_public";
process.env.IMAGEKIT_PRIVATE_KEY = "fake_private";
process.env.IMAGEKIT_URL_ENDPOINT = "https://fake.endpoint";

// ✅ Global hooks (optional, but nice cleanup)
afterEach(() => {
  jest.clearAllMocks();
});
