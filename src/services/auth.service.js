const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const authService = {
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("User account is inactive");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        depot_id: user.depot_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    const {
      password_hash,
      ...safeUser
    } = user;

    return {
      token,
      user: safeUser,
    };
  },

  async register(data) {
    if (
      !data.name ||
      !data.email ||
      !data.password
    ) {
      throw new Error(
        "Name, email and password are required"
      );
    }

    const existing = await User.findByEmail(
      data.email
    );

    if (existing) {
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      10
    );

    const id = await User.create({
      ...data,
      password_hash: passwordHash,
    });

    return await User.findById(id);
  },
};

module.exports = authService;