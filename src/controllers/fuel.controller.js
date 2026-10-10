
const fuelService = require("../services/fuel.service");

const getAllFuelLogs = async (req, res) => {
  try {
    const data = await fuelService.getAllFuelLogs();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFuelLogById = async (req, res) => {
  try {
    const data = await fuelService.getFuelLogById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createFuelLog = async (req, res) => {
  try {
    const data = await fuelService.createFuelLog(req.body);

    res.status(201).json({
      success: true,
      message: "Fuel record created successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateFuelLog = async (req, res) => {
  try {
    const data = await fuelService.updateFuelLog(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Fuel record updated successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFuelLog = async (req, res) => {
  try {
    await fuelService.deleteFuelLog(req.params.id);

    res.status(200).json({
      success: true,
      message: "Fuel record deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
};