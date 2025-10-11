const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");
const {publishToQueue} = require("../broker/broker")

async function registerController(req, res) {
  try {
    const { firstName, lastName, email, role, password } = req.body;

    const userExist = await userModel.findOne({ email });

    if (userExist)
      return res.status(409).json({
        message: "User Already Exist.",
      });

    const user = await userModel.create({
      username: {
        firstName,
        lastName,
      },
      email,
      role,
      password: await bcrypt.hash(password, 10),
    });

    await publishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.username.firstName + " " + user.username.lastName
    })

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
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
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function loginController(req, res) {
  try {
    const { firstName, email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await userModel
      .findOne({ $or: [{ email }, { firstName }] })
      .select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getCurrentUser(req, res) {
  return res
    .status(200)
    .json({ message: "Current user fetched successfully.", user: req.user });
}

async function logoutUser(req, res) {
  const token = req.cookies.token;

  if (token) await redis.set(`blacklist:${token}`, "true", "EX", 24 * 60 * 60);

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });

  return res.status(200).json({ message: "Logged out successfully" });
}

async function getUserAddresses(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await userModel.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Addresses fetched successfully.",
      addresses: user.addresses || [],
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function addUserAddresses(req, res) {
  const id = req.user?.id;
  const { name, street, city, state, zip, phone, country } = req.body || {};

  const user = await userModel.findByIdAndUpdate(id, {
    $push: {
      addresses: {
        name,
        street,
        city,
        state,
        zip,
        phone,
        country,
      },
    },
  }, { new: true });

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({
    message: "Address added successfully.",
    addresses: user.addresses[user.addresses.length - 1],
  })
}

async function deleteUserAddresses(req, res) {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  registerController,
  loginController,
  getCurrentUser,
  logoutUser,
  getUserAddresses,
  addUserAddresses,
  deleteUserAddresses
};
