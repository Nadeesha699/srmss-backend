
const driverService = require("../services/driver.service");

const sendError = (res, error) => {
  const message = error.message || "Internal server error";

  const status = message.includes("not found")
    ? 404
    : message.includes("already exists") ||
        message.includes("required") ||
        message.includes("Invalid") ||
        message.includes("must be") ||
        message.includes("has assignments")
      ? 400
      : 500;

  return res.status(status).json({
    success: false,
    message,
  });
};

const driverController = {
  async getAll(req, res) {
    try {
      const data = await driverService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      sendError(res, error);
    }
  },

  async getById(req, res) {
    try {
      const data = await driverService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      sendError(res, error);
    }
  },

  async create(req, res) {
    try {
      const data = await driverService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Driver created successfully",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async update(req, res) {
    try {
      const data = await driverService.update(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: "Driver updated successfully",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async updateStatus(req, res) {
    try {
      const data = await driverService.updateStatus(
        req.params.id,
        req.body.status
      );

      res.json({
        success: true,
        message: "Driver status updated",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async delete(req, res) {
    try {
      await driverService.delete(req.params.id);

      res.json({
        success: true,
        message: "Driver deleted successfully",
      });
    } catch (error) {
      sendError(res, error);
    }
  },
};

module.exports = driverController;