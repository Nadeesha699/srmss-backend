const Report = require("../models/report.model");

const reportService = {
  async getDashboardSummary() {
    return await Report.getDashboardSummary();
  },

  async getTripStatistics() {
    return await Report.getTripStatistics();
  },

  async getTripCompletionReport() {
    return await Report.getTripCompletionReport();
  },

  async getFuelStatistics() {
    return await Report.getFuelStatistics();
  },

  async getFuelByBus() {
    return await Report.getFuelByBus();
  },

  async getMaintenanceStatistics() {
    return await Report.getMaintenanceStatistics();
  },

  async getMaintenanceByBus() {
    return await Report.getMaintenanceByBus();
  },

  async getRoutePerformance() {
    return await Report.getRoutePerformance();
  },

  async getDepotPerformance() {
    return await Report.getDepotPerformance();
  },

  async getDelayReport() {
    return await Report.getDelayReport();
  },

  async getVehicleUtilization() {
    return await Report.getVehicleUtilization();
  },

  async getDriverWorkload() {
    return await Report.getDriverWorkload();
  },
};

module.exports = reportService;