
// const express = require("express");

// const AssignmentController = require(
//   "../controllers/assignment.controller"
// );

// const router = express.Router();


// // Get all assignments
// router.get(
//   "/",
//   AssignmentController.getAll
// );

// // Get single assignment
// router.get(
//   "/:id",
//   AssignmentController.getById
// );

// // Create new assignment
// router.post(
//   "/",
//   AssignmentController.create
// );

// // Update assignment
// router.put(
//   "/:id",
//   AssignmentController.update
// );

// // Update assignment status
// router.patch(
//   "/:id/status",
//   AssignmentController.updateStatus
// );

// // Delete assignment
// router.delete(
//   "/:id",
//   AssignmentController.delete
// );

// module.exports = router;


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