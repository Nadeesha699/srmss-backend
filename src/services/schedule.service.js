const ScheduleModel = require("../models/schedule.model");

const ScheduleService = {
  async getAllSchedules() {
    return await ScheduleModel.findAll();
  },

  async getScheduleById(id) {
    return await ScheduleModel.findById(id);
  },

  async createSchedule(data) {
    return await ScheduleModel.create(data);
  },

  async updateSchedule(id, data) {
    return await ScheduleModel.update(id, data);
  },

  async deleteSchedule(id) {
    return await ScheduleModel.delete(id);
  },

  async updateScheduleStatus(id, status) {
    const allowedStatuses = [
      "SCHEDULED",
      "RUNNING",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid schedule status");
    }

    return await ScheduleModel.updateStatus(id, status);
  },
};

module.exports = ScheduleService;