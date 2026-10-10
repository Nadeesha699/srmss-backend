const MaintenanceService = require("../services/maintenance.service");

const getAllMaintenance = async (req, res) => {
  try {
    const records = await MaintenanceService.getAllMaintenance();

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Get maintenance records error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance records",
    });
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance record ID",
      });
    }

    const record = await MaintenanceService.getMaintenanceById(id);

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    const notFound = error.message === "Maintenance record not found";

    return res.status(notFound ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch maintenance record",
    });
  }
};

const createMaintenance = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      // Prefer the authenticated user's ID if your auth middleware provides it.
      recorded_by: req.user?.id ?? req.body.recorded_by ?? null,
    };

    const record = await MaintenanceService.createMaintenance(payload);

    return res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      data: record,
    });
  } catch (error) {
    console.error("Create maintenance record error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create maintenance record",
    });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance record ID",
      });
    }

    const record = await MaintenanceService.updateMaintenance(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      data: record,
    });
  } catch (error) {
    const notFound = error.message === "Maintenance record not found";

    return res.status(notFound ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update maintenance record",
    });
  }
};

const updateMaintenanceStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance record ID",
      });
    }

    const record = await MaintenanceService.updateMaintenanceStatus(
      id,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Maintenance status updated successfully",
      data: record,
    });
  } catch (error) {
    const notFound = error.message === "Maintenance record not found";

    return res.status(notFound ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update maintenance status",
    });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance record ID",
      });
    }

    await MaintenanceService.deleteMaintenance(id);

    return res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    const notFound = error.message === "Maintenance record not found";

    return res.status(notFound ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to delete maintenance record",
    });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
};