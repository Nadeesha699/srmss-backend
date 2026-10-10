
const express = require("express");
const router = express.Router();

const driverController = require("../controllers/driver.controller");

router.get("/", driverController.getAll);
router.get("/:id", driverController.getById);
router.post("/", driverController.create);
router.put("/:id", driverController.update);
router.patch("/:id/status", driverController.updateStatus);
router.delete("/:id", driverController.delete);

module.exports = router;