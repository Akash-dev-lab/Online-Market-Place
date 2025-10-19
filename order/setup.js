// src/tests/setup.js — pure isolation test setup

// Keep mongoose schema functionality but block real connections
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(),
    connection: { close: jest.fn() },
    Types: {
      ObjectId: actualMongoose.Types.ObjectId,
      isValid: jest.fn().mockReturnValue(true),
    },
  };
});

// Fake environment variables
process.env.JWT_SECRET = "test_secret";
process.env.IMAGEKIT_PUBLIC_KEY = "fake_public";
process.env.IMAGEKIT_PRIVATE_KEY = "fake_private";
process.env.IMAGEKIT_URL_ENDPOINT = "https://fake.endpoint";

afterEach(() => {
  jest.clearAllMocks();
});
