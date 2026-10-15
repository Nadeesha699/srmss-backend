const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Depot = require("../models/depot.model");

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

    // Check duplicate email
    const existing = await User.findByEmail(data.email);

    if (existing && Number(existing.id) !== Number(id)) {
      throw new Error("Email already exists");
    }

    // Only apply depot manager validation to supervisors
    if (data.role === "SUPERVISOR") {
      if (!data.depot_id) {
        throw new Error("Depot is required for a supervisor");
      }

      // Find the depot
      const depot = await Depot.findById(data.depot_id);

      if (!depot) {
        throw new Error("Depot not found");
      }

      // Check whether another supervisor already manages this depot
      const assignedManager = await User.findByDepotId(data.depot_id);

      if (assignedManager && Number(assignedManager.id) !== Number(id)) {
        throw new Error("This depot is already assigned to another supervisor");
      }
    }

    await User.update(id, data);

    return await User.findById(id);
  },

  async updateProfile(id, data) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const existing = await User.findByEmail(data.email);

    if (existing && existing.id !== Number(id)) {
      throw new Error("Email already exists");
    }

    await User.updateProfile(id, data);

    return await User.findById(id);
  },

  async changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found.");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect.");
    }

    if (newPassword.length < 8) {
      throw new Error("New password must contain at least 8 characters.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const affectedRows = await User.updatePassword(id, passwordHash);

    if (affectedRows === 0) {
      throw new Error("Password could not be updated.");
    }

    return { message: "Password changed successfully." };
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
