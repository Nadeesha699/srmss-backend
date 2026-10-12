const ScheduleModel = require("../models/schedule.model");

const ScheduleService = {
  async getAllSchedules() {
    return await ScheduleModel.findAll();
  },

  async getScheduleById(id) {
    return await ScheduleModel.findById(id);
  },

  async createSchedule(data) {
    const conflict = await ScheduleModel.findTimeConflict(data);

    if (conflict) {
      const error = new Error(
        `Schedule conflicts with ${conflict.schedule_code} ` +
          `(${conflict.departure_time} - ${conflict.arrival_time}).`,
      );
      error.statusCode = 409;
      throw error;
    }

    return await ScheduleModel.create(data);
  },

  async updateSchedule(id, data) {
    const conflict = await ScheduleModel.findTimeConflict(data, id);

    if (conflict) {
      const error = new Error(
        `Schedule conflicts with ${conflict.schedule_code} ` +
          `(${conflict.departure_time} - ${conflict.arrival_time}).`,
      );
      error.statusCode = 409;
      throw error;
    }

    return await ScheduleModel.update(id, data);
  },

  async deleteSchedule(id) {
    return await ScheduleModel.delete(id);
  },

  async updateScheduleStatus(id, status) {
    return await ScheduleModel.updateStatus(id, status);
  },
};

module.exports = ScheduleService;
