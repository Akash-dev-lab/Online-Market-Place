const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");

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

async function loginController(req, res) {
  try {
    const { firstName, email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await userModel.findOne({ $or: [{email}, {firstName}] }).select("+password");
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
      { expiresIn: '1d' }
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
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    console.error("Error in loginController:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({ message: "Current user fetched successfully.", user: req.user });
}

async function logoutUser(req, res) {
  // Read session id from cookie named 'sid'
  const sid = req.cookies && req.cookies.sid;

  if (sid) {
    try {
      // delete session key in redis
      await redis.del(sid);
      // clear the cookie named 'sid'
      res.clearCookie('sid', {
        httpOnly: true,
        secure: true
      });
      return res.status(200).json({ message: 'Logged out' });
    } catch (error) {
      return res.status(500).json({ message: 'Logout failed' });
    }
  } else {
    // no sid present: still clear cookie and return success
    res.clearCookie('sid', {
      httpOnly: true,
      secure: true
    });
    return res.status(200).json({ message: 'Logged out' });
  }
}

module.exports = {
  registerController,
  loginController,
  getCurrentUser,
  logoutUser
};
