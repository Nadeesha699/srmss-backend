const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignment.controller");

// Add your existing authentication and role middleware here.
router.get("/", assignmentController.getAll);
router.get("/:id", assignmentController.getById);
router.post("/", assignmentController.create);
router.put("/:id", assignmentController.update);
router.patch("/:id/status", assignmentController.updateStatus);
router.delete("/:id", assignmentController.delete);

module.exports = router;