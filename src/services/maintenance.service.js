const Maintenance = require("../models/maintenance.model");


const MaintenanceService = {
  async getAllMaintenance() {
    return Maintenance.findAll();
  },

  async getMaintenanceById(id) {
    const record = await Maintenance.findById(id);

    if (!record) {
      throw new Error("Maintenance record not found");
    }

    return record;
  },

  async createMaintenance(data) {
    this.validate(data);

    const payload = {
      trip_id: data.trip_id || null,
      bus_id: Number(data.bus_id),
      maintenance_type: String(data.maintenance_type).trim(),
      description: data.description?.trim() || null,
      service_date: data.service_date,
      cost: Number(data.cost ?? 0),
      status: data.status || "PENDING",
      recorded_by: data.recorded_by ?? null,
    };

    this.validateCost(payload.cost);

    return Maintenance.create(payload);
  },

  async updateMaintenance(id, data) {
    const existing = await Maintenance.findById(id);

    if (!existing) {
      throw new Error("Maintenance record not found");
    }

    this.validate(data);

    const payload = {
      trip_id: data.trip_id || null,
      bus_id: Number(data.bus_id),
      maintenance_type: String(data.maintenance_type).trim(),
      description: data.description?.trim() || null,
      service_date: data.service_date,
      cost: Number(data.cost ?? 0),
      status: data.status || existing.status || "PENDING",
    };

    this.validateCost(payload.cost);

    return Maintenance.update(id, payload);
  },

  async updateMaintenanceStatus(id, status) {
    const existing = await Maintenance.findById(id);

    if (!existing) {
      throw new Error("Maintenance record not found");
    }

    return Maintenance.updateStatus(id, status);
  },

  async deleteMaintenance(id) {
    const existing = await Maintenance.findById(id);

    if (!existing) {
      throw new Error("Maintenance record not found");
    }

    return Maintenance.delete(id);
  },

  validate(data) {
    if (!data.bus_id || !Number.isInteger(Number(data.bus_id))) {
      throw new Error("A valid bus_id is required");
    }

    if (
      !data.maintenance_type ||
      !String(data.maintenance_type).trim()
    ) {
      throw new Error("Maintenance type is required");
    }

    if (!data.service_date) {
      throw new Error("Service date is required");
    }

    if (data.trip_id && !Number.isInteger(Number(data.trip_id))) {
      throw new Error("trip_id must be a valid number");
    }
  },


  validateCost(cost) {
    if (!Number.isFinite(cost) || cost < 0) {
      throw new Error("Cost must be a valid non-negative number");
    }
  },
};

module.exports = MaintenanceService;