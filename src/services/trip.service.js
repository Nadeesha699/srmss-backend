const Trip = require("../models/trip.model");

const tripService = {
  async getAllTrips() {
    return await Trip.findAll();
  },

  async getTripById(id) {
    const trip = await Trip.findById(id);

    if (!trip) {
      throw new Error("Trip not found");
    }

    return trip;
  },

  async createTrip(data) {
    if (!data.schedule_id) {
      throw new Error("Schedule is required");
    }

    const id = await Trip.create(data);

    return await Trip.findById(id);
  },

  async updateTrip(id, data) {
    const trip = await Trip.findById(id);

    if (!trip) {
      throw new Error("Trip not found");
    }

    await Trip.update(id, data);

    return await Trip.findById(id);
  },

   async updateStatus(id, data) {
    const affectedRows = await Trip.updateStatus(id, data);

    if (affectedRows === 0) {
      throw new Error("Trip not found or no changes made");
    }

    return affectedRows;
  },
};



module.exports = tripService;