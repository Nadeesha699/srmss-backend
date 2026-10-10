const express = require("express");
const router = express.Router();
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateStatus
} = require("../controllers/trip.controller");
const auth = require("../middlewares/auth");

router.get("/", getAllTrips);
router.get("/:id", getTripById);
router.post("/", createTrip);
router.put("/:id", updateTrip);
router.patch("/:id/status", updateStatus);

module.exports = router;

