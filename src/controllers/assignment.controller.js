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