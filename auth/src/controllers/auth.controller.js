const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
  try {
  const { firstName, lastName, email, addresses, password,} = req.body;

  const userExist = await userModel.findOne({ email });

  if (userExist) return res.status(409).json({
      message: "User Already Exist.",
    });

  const user = await userModel.create({
    username: {
      firstName,
      lastName,
    },
    email,
    addresses: addresses || [],
    password: await bcrypt.hash(password, 10),
  });

  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: "user registered successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      addresses: user.addresses
    }
  });
  } catch (error) {
    console.error("Error in registerController:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = { registerController };
