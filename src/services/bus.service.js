const Bus = require("../models/bus.model");

const busService = {
  async getAllBuses() {
    return await Bus.findAll();
  },

  async getBusById(id) {
    const bus = await Bus.findById(id);

    if (!bus) {
      throw new Error("Bus not found");
    }

    return bus;
  },

  async createBus(data) {
    if (
      !data.registration_no ||
      !data.capacity ||
      !data.service_type ||
      !data.depot_id
    ) {
      throw new Error(
        "Registration number, capacity, service type and depot are required"
      );
    }

    const existing = await Bus.findByRegistration(
      data.registration_no
    );

    if (existing) {
      throw new Error("Registration number already exists");
    }

    const id = await Bus.create(data);

    return await Bus.findById(id);
  },

  async updateBus(id, data) {
    const bus = await Bus.findById(id);

    if (!bus) {
      throw new Error("Bus not found");
    }

    await Bus.update(id, data);

    return await Bus.findById(id);
  },

  async deleteBus(id) {
    const bus = await Bus.findById(id);

    if (!bus) {
      throw new Error("Bus not found");
    }

    await Bus.delete(id);

    return true;
  },
};

module.exports = busService;