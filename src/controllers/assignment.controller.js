
// const AssignmentService = require(
//   "../models/assignment.model"
// );

// const AssignmentController = {
//   // GET /api/assignments
//   async getAll(req, res) {
//     try {
//       const assignments =
//         await AssignmentService.getAllAssignments();

//       return res.status(200).json({
//         success: true,
//         data: assignments,
//       });
//     } catch (error) {
//       console.error(
//         "Get assignments error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },

//   // GET /api/assignments/:id
//   async getById(req, res) {
//     try {
//       const assignment =
//         await AssignmentService.getAssignmentById(
//           req.params.id
//         );

//       return res.status(200).json({
//         success: true,
//         data: assignment,
//       });
//     } catch (error) {
//       console.error(
//         "Get assignment error:",
//         error
//       );

//       const status =
//         error.message === "Assignment not found"
//           ? 404
//           : 500;

//       return res.status(status).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },

//   // POST /api/assignments
//   async create(req, res) {
//     try {
//       const assignment =
//         await AssignmentService.createAssignment(
//           req.body
//         );

//       return res.status(201).json({
//         success: true,
//         message:
//           "Assignment created successfully",
//         data: assignment,
//       });
//     } catch (error) {
//       console.error(
//         "Create assignment error:",
//         error
//       );

//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },

//   // PUT /api/assignments/:id
//   async update(req, res) {
//     try {
//       const assignment =
//         await AssignmentService.updateAssignment(
//           req.params.id,
//           req.body
//         );

//       return res.status(200).json({
//         success: true,
//         message:
//           "Assignment updated successfully",
//         data: assignment,
//       });
//     } catch (error) {
//       console.error(
//         "Update assignment error:",
//         error
//       );

//       const status =
//         error.message === "Assignment not found"
//           ? 404
//           : 400;

//       return res.status(status).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },

//   // PATCH /api/assignments/:id/status
//   async updateStatus(req, res) {
//     try {
//       const { status } = req.body;

//       const assignment =
//         await AssignmentService.updateAssignmentStatus(
//           req.params.id,
//           status
//         );

//       return res.status(200).json({
//         success: true,
//         message:
//           "Assignment status updated successfully",
//         data: assignment,
//       });
//     } catch (error) {
//       console.error(
//         "Update assignment status error:",
//         error
//       );

//       const statusCode =
//         error.message === "Assignment not found"
//           ? 404
//           : 400;

//       return res.status(statusCode).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },

//   // DELETE /api/assignments/:id
//   async delete(req, res) {
//     try {
//       await AssignmentService.deleteAssignment(
//         req.params.id
//       );

//       return res.status(200).json({
//         success: true,
//         message:
//           "Assignment deleted successfully",
//       });
//     } catch (error) {
//       console.error(
//         "Delete assignment error:",
//         error
//       );

//       const status =
//         error.message === "Assignment not found"
//           ? 404
//           : 400;

//       return res.status(status).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },
// };

// module.exports = AssignmentController;


const assignmentService = require("../services/assignment.service");

const handleError = (res, error) => {
  const message = error.message || "Internal server error";

  const status =
    message.includes("not found") ? 404 :
    message.includes("required") ||
    message.includes("available") ||
    message.includes("valid") ||
    message.includes("overlapping") ||
    message.includes("licence") ||
    message.includes("license") ||
    message.includes("Only") ||
    message.includes("cannot") ||
    message.includes("must be") ||
    message.includes("active") ||
    message.includes("Invalid")
      ? 400 : 500;

  return res.status(status).json({
    success: false,
    message,
  });
};

const assignmentController = {
  async getAll(_, res) {
    try {
      const data = await assignmentService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, error);
    }
  },

  async getById(req, res) {
    try {
      const data = await assignmentService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, error);
    }
  },

  async create(req, res) {
    try {

      const data = await assignmentService.create(
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Assignment and trip created successfully",
        data,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  async update(req, res) {
    try {
      const data = await assignmentService.update(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: "Assignment updated successfully",
        data,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  async updateStatus(req, res) {
    try {
      const data = await assignmentService.updateStatus(
        req.params.id,
        req.body.status
      );

      res.json({
        success: true,
        message: "Assignment status updated",
        data,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  async delete(req, res) {
    try {
      await assignmentService.delete(req.params.id);

      res.json({
        success: true,
        message: "Assignment cancelled successfully",
      });
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = assignmentController;