
const ScheduleService = require("../services/schedule.service");

// GET ALL SCHEDULES
const getSchedules = async (req, res) => {
  try {
    const schedules = await ScheduleService.getAllSchedules();

    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
    });
  }
};

// GET SCHEDULE BY ID
const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await ScheduleService.getScheduleById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Get schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
    });
  }
};

// CREATE SCHEDULE
const createSchedule = async (req, res) => {
  try {
    const {
      schedule_code,
      route_id,
      depot_id,
      schedule_date,
      departure_time,
      arrival_time,
      status,
    } = req.body;

    // Validate required fields
    if (
      !schedule_code?.trim() ||
      !route_id ||
      !depot_id ||
      !schedule_date ||
      !departure_time ||
      !arrival_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required schedule fields.",
      });
    }

    // Validate IDs
    if (
      !Number.isInteger(Number(route_id)) ||
      Number(route_id) <= 0 ||
      !Number.isInteger(Number(depot_id)) ||
      Number(depot_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid route and depot.",
      });
    }

    // Validate schedule status against the database ENUM
    const allowedStatuses = ["DRAFT", "SCHEDULED", "CANCELLED"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status.",
      });
    }

    // Create schedule
    const id = await ScheduleService.createSchedule({
      schedule_code: schedule_code.trim(),
      route_id: Number(route_id),
      depot_id: Number(depot_id),
      schedule_date,
      departure_time,
      arrival_time,
      status: status || "SCHEDULED",
    });

    const schedule = await ScheduleService.getScheduleById(id);

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This schedule code already exists.",
      });
    }

    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      return res.status(400).json({
        success: false,
        message: "The selected route or depot does not exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create schedule",
      error: error.message,
    });
  }
};

// UPDATE SCHEDULE
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await ScheduleService.updateSchedule(
      id,
      req.body
    );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or no changes were made.",
      });
    }

    const schedule = await ScheduleService.getScheduleById(id);

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This schedule code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error.message,
    });
  }
};

// DELETE SCHEDULE
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await ScheduleService.deleteSchedule(id);

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
    });
  }
};

// UPDATE SCHEDULE STATUS
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["DRAFT", "SCHEDULED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status.",
      });
    }

    const affectedRows = await ScheduleService.updateScheduleStatus(
      id,
      status
    );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or status unchanged.",
      });
    }

    const schedule = await ScheduleService.getScheduleById(id);

    return res.status(200).json({
      success: true,
      message: "Schedule status updated successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Update schedule status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update schedule status",
    });
  }
};

module.exports = {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateStatus,
};