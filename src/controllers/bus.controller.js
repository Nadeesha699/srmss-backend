const busService = require("../services/bus.service");

const getAllBuses = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await busService.getAllBuses(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBusById = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await busService.getBusById(req.params.id),
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createBus = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: await busService.createBus(req.body),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBus = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Bus updated successfully",
      data: await busService.updateBus(
        req.params.id,
        req.body
      ),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBus = async (req, res) => {
  try {
    await busService.deleteBus(req.params.id);

    res.json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};