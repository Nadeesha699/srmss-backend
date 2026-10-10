const express = require("express");

const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateStatus,
} = require("../controllers/schedule.controller");

const router = express.Router();

router.get("/", getSchedules);

router.get("/:id", getSchedule);

router.post("/", createSchedule);

router.put("/:id", updateSchedule);

router.delete("/:id", deleteSchedule);

router.patch("/:id/status", updateStatus);

module.exports = router;