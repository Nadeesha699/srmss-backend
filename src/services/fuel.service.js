
const Fuel = require("../models/fuel.model");

const fuelService = {
  async getAllFuelLogs() {
    return Fuel.findAll();
  },

  async getFuelLogById(id) {
    const record = await Fuel.findById(id);

    if (!record) {
      throw new Error("Fuel record not found");
    }

    return record;
  },

  async createFuelLog(data) {
    const busId = Number(data.bus_id);
    const liters = Number(
      data.quantity_liters ?? data.liters
    );
    const unitPrice = Number(data.unit_price ?? 0);
    const mileage = Number(
      data.odometer_reading ?? data.mileage ?? 0
    );

    if (!Number.isInteger(busId) || busId <= 0) {
      throw new Error("A valid bus is required");
    }

    if (
      !data.fuel_date ||
      !Number.isFinite(liters) ||
      liters <= 0
    ) {
      throw new Error("Valid fuel date and quantity are required");
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      throw new Error("Price and mileage must be valid non-negative numbers");
    }

    const id = await Fuel.create({
      bus_id: busId,
      trip_id: data.trip_id || null,
      fuel_type: data.fuel_type || "DIESEL",
      fuel_date: data.fuel_date,
      liters,
      unit_price: unitPrice,
      cost: Number((liters * unitPrice).toFixed(2)),
      mileage,
      recorded_by: data.staff_id || data.recorded_by || null,
      notes: data.notes || null,
    });

    return this.getFuelLogById(id);
  },

  async updateFuelLog(id, data) {
    await this.getFuelLogById(id);

    const busId = Number(data.bus_id);
    const liters = Number(
      data.quantity_liters ?? data.liters
    );
    const unitPrice = Number(data.unit_price ?? 0);
    const mileage = Number(
      data.odometer_reading ?? data.mileage ?? 0
    );

    if (
      !Number.isInteger(busId) ||
      busId <= 0 ||
      !data.fuel_date ||
      !Number.isFinite(liters) ||
      liters <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      throw new Error("Please provide valid fuel record details");
    }

    await Fuel.update(id, {
      bus_id: busId,
      trip_id: data.trip_id || null,
      fuel_type: data.fuel_type || "DIESEL",
      fuel_date: data.fuel_date,
      liters,
      unit_price: unitPrice,
      cost: Number((liters * unitPrice).toFixed(2)),
      mileage,
      notes: data.notes || null,
    });

    return this.getFuelLogById(id);
  },

  async deleteFuelLog(id) {
    await this.getFuelLogById(id);
    await Fuel.delete(id);
    return true;
  },
};

module.exports = fuelService;