
const delayService = require("../services/delay.service");

const delayController = {
  // GET /api/delays
  async getAll(req, res) {
    try {
      const delays = await delayService.getAll();

      return res.status(200).json({
        success: true,
        data: delays,
      });
    } catch (error) {
      console.error("Get delays error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve delay reports.",
      });
    }
  },

  // GET /api/delays/:id
  async getById(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid delay report ID.",
        });
      }

      const delay = await delayService.getById(id);

      return res.status(200).json({
        success: true,
        data: delay,
      });
    } catch (error) {
      const status = error.message === "Delay report not found." ? 404 : 500;

      return res.status(status).json({
        success: false,
        message:
          status === 404
            ? error.message
            : "Failed to retrieve delay report.",
      });
    }
  },

  // POST /api/delays
  async create(req, res) {
    try {
      const {
        trip_id,
        delay_minutes,
        reason,
        notes,
        recorded_by,
      } = req.body;

      if (
        trip_id == null ||
        delay_minutes == null ||
        !String(reason || "").trim() ||
        recorded_by == null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Trip, delay duration, reason and reporting user are required.",
        });
      }

      const delay = await delayService.create({
        trip_id,
        delay_minutes,
        reason,
        notes,
        recorded_by,
      });

      return res.status(201).json({
        success: true,
        message: "Delay report submitted successfully.",
        data: delay,
      });
    } catch (error) {
      console.error("Create delay error:", error);

      const clientError =
        /required|valid|positive whole number/i.test(error.message);

      return res.status(clientError ? 400 : 500).json({
        success: false,
        message: clientError
          ? error.message
          : "Failed to create delay report. Check the trip, user and database records.",
      });
    }
  },

  // PUT /api/delays/:id
  async update(req, res) {
    try {
      const delay = await delayService.update(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Delay report updated successfully.",
        data: delay,
      });
    } catch (error) {
      console.error("Update delay error:", error);

      const notFound = error.message === "Delay report not found.";
      const clientError =
        notFound ||
        /required|valid|positive whole number/i.test(error.message);

      return res.status(notFound ? 404 : clientError ? 400 : 500).json({
        success: false,
        message: clientError
          ? error.message
          : "Failed to update delay report.",
      });
    }
  },

  // DELETE /api/delays/:id
  async delete(req, res) {
    try {
      await delayService.delete(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Delay report deleted successfully.",
      });
    } catch (error) {
      console.error("Delete delay error:", error);

      const notFound = error.message === "Delay report not found.";
      const invalidId = error.message === "Invalid delay report ID.";

      return res.status(notFound ? 404 : invalidId ? 400 : 500).json({
        success: false,
        message:
          notFound || invalidId
            ? error.message
            : "Failed to delete delay report.",
      });
    }
  },
};

module.exports = delayController;