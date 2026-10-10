const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const userService = {
  async getAllUsers() {
    return await User.findAll();
  },

  async getUserById(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async createUser(data) {
    if (!data.name || !data.email || !data.password) {
      throw new Error("Name, email and password are required");
    }

    const existing = await User.findByEmail(data.email);

    if (existing) {
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const id = await User.create({
      ...data,
      password_hash: passwordHash,
    });

    return await User.findById(id);
  },

  async updateUser(id, data) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const existing = await User.findByEmail(data.email);

    if (existing && existing.id !== Number(id)) {
      throw new Error("Email already exists");
    }

    await User.update(id, data);

    return await User.findById(id);
  },

  async deleteUser(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await User.delete(id);

    return true;
  },
};

module.exports = userService;