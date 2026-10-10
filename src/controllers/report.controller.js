const reportService = require("../services/report.service");

const getDashboardSummary = async (req, res) => {
  try {
    const data =
      await reportService.getDashboardSummary();

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

const getTripStatistics = async (req, res) => {
  try {
    const data =
      await reportService.getTripStatistics();

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

const getTripCompletionReport = async (req, res) => {
  try {
    const data =
      await reportService.getTripCompletionReport();

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

const getFuelStatistics = async (req, res) => {
  try {
    const data =
      await reportService.getFuelStatistics();

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

const getFuelByBus = async (req, res) => {
  try {
    const data =
      await reportService.getFuelByBus();

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

const getMaintenanceStatistics = async (req, res) => {
  try {
    const data =
      await reportService.getMaintenanceStatistics();

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

const getMaintenanceByBus = async (req, res) => {
  try {
    const data =
      await reportService.getMaintenanceByBus();

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

const getRoutePerformance = async (req, res) => {
  try {
    const data =
      await reportService.getRoutePerformance();

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

const getDepotPerformance = async (req, res) => {
  try {
    const data =
      await reportService.getDepotPerformance();

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

const getDelayReport = async (req, res) => {
  try {
    const data =
      await reportService.getDelayReport();

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

const getVehicleUtilization = async (req, res) => {
  try {
    const data =
      await reportService.getVehicleUtilization();

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

const getDriverWorkload = async (req, res) => {
  try {
    const data =
      await reportService.getDriverWorkload();

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

module.exports = {
  getDashboardSummary,
  getTripStatistics,
  getTripCompletionReport,
  getFuelStatistics,
  getFuelByBus,
  getMaintenanceStatistics,
  getMaintenanceByBus,
  getRoutePerformance,
  getDepotPerformance,
  getDelayReport,
  getVehicleUtilization,
  getDriverWorkload,
};