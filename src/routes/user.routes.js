const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  changePassword,
  deleteUser,
} = require("../controllers/user.controller");
const auth = require("../middlewares/auth");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/profile/:id", updateProfile);
router.put("/:id/password", changePassword);
router.delete("/:id", deleteUser);

module.exports = router;
