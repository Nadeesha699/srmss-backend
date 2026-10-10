const express = require("express");

const router = express.Router();

const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require("../controllers/bus.controller");

const auth = require("../middlewares/auth");

router.get("/", getAllBuses);
router.get("/:id", getBusById);
router.post("/", createBus);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);

module.exports = router;