const userService = require("../services/user.service");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


  const  changePassword= async(req, res)=> {
    try {
      const id = Number(req.params.id);
      const { currentPassword, newPassword } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required.",
        });
      }

      if (typeof currentPassword !== "string" ||
          typeof newPassword !== "string") {
        return res.status(400).json({
          success: false,
          message: "Passwords must be strings.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must contain at least 8 characters.",
        });
      }

      const result = await userService.changePassword(
        id,
        currentPassword,
        newPassword
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const isInvalidPassword =
        error.message === "Current password is incorrect.";

      const isNotFound = error.message === "User not found.";

      console.error("Change password error:", error);

      return res.status(
        isInvalidPassword ? 400 : isNotFound ? 404 : 500
      ).json({
        success: false,
        message:
          isInvalidPassword || isNotFound
            ? error.message
            : "Unable to change password.",
      });
    }
  };


const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  changePassword,
  deleteUser,
};