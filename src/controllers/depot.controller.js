const depotService = require("../services/depot.service");

// Get all depots
const getAllDepots = async (req, res) => {
  try {
    const depots = await depotService.getAllDepots();

    res.status(200).json({
      success: true,
      data: depots,
    });
  } catch (error) {
    console.error("Get depots error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get depot by ID
const getDepotById = async (req, res) => {
  try {
    const { id } = req.params;

    const depot = await depotService.getDepotById(id);

    res.status(200).json({
      success: true,
      data: depot,
    });
  } catch (error) {
    console.error("Get depot error:", error);

    const statusCode =
      error.message === "Depot not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Create depot
const createDepot = async (req, res) => {
  try {
    const depot = await depotService.createDepot(req.body);

    res.status(201).json({
      success: true,
      message: "Depot created successfully",
      data: depot,
    });
  } catch (error) {
    console.error("Create depot error:", error);

    const statusCode =
      error.message.includes("required") ||
      error.message.includes("already exists") ||
      error.message.includes("Invalid")
        ? 400
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Update depot
const updateDepot = async (req, res) => {
  try {
    const { id } = req.params;

    const depot = await depotService.updateDepot(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Depot updated successfully",
      data: depot,
    });
  } catch (error) {
    console.error("Update depot error:", error);

    let statusCode = 500;

    if (error.message === "Depot not found") {
      statusCode = 404;
    } else if (
      error.message.includes("required") ||
      error.message.includes("already exists") ||
      error.message.includes("Invalid")
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Change depot status
const changeDepotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const depot = await depotService.changeDepotStatus(
      id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Depot status updated successfully",
      data: depot,
    });
  } catch (error) {
    console.error("Change depot status error:", error);

    let statusCode = 500;

    if (error.message === "Depot not found") {
      statusCode = 404;
    } else if (error.message.includes("must be")) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete depot
const deleteDepot = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await depotService.deleteDepot(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete depot error:", error);

    let statusCode = 500;

    if (error.message === "Depot not found") {
      statusCode = 404;
    }

    if (
      error.message.includes(
        "Cannot delete depot"
      )
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllDepots,
  getDepotById,
  createDepot,
  updateDepot,
  changeDepotStatus,
  deleteDepot,
};