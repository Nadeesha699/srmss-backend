const Depot = require("../models/depot.model");
const User = require("../models/user.model");

const depotService = {
  async getAllDepots() {
    return await Depot.findAll();
  },

  async getDepotById(id) {
    const depot = await Depot.findById(id);

    if (!depot) {
      throw new Error("Depot not found");
    }

    return depot;
  },

  async createDepot(data) {
    if (!data.depot_code?.trim()) {
      throw new Error("Depot code is required");
    }

    if (!data.name?.trim()) {
      throw new Error("Depot name is required");
    }

    if (!data.location?.trim()) {
      throw new Error("Depot location is required");
    }

    if (!data.manager_id) {
      throw new Error("Manager ID is required");
    }

    // Check manager exists
    const manager = await User.findById(data.manager_id);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "SUPERVISOR") {
      throw new Error("Selected user is not a supervisor");
    }

    // Check whether supervisor already manages a depot
    const existingManagedDepot = await Depot.findByManagerId(
      Number(data.manager_id),
    );

    if (existingManagedDepot) {
      throw new Error(
        `This supervisor already manages depot: ${existingManagedDepot.name}`,
      );
    }

    // Check duplicate depot code
    const existingDepot = await Depot.findByCode(data.depot_code.trim());

    if (existingDepot) {
      throw new Error("Depot code already exists");
    }

    // Validate status
    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error("Invalid depot status");
    }

    // Create depot
    const depotId = await Depot.create({
      depot_code: data.depot_code.trim(),
      name: data.name.trim(),
      location: data.location.trim(),
      manager_id: Number(data.manager_id),
      status: data.status || "ACTIVE",
    });

    return await Depot.findById(depotId);
  },

  async updateDepot(id, data) {
    const existingDepot = await Depot.findById(id);

    if (!existingDepot) {
      throw new Error("Depot not found");
    }

    if (!data.depot_code?.trim()) {
      throw new Error("Depot code is required");
    }

    if (!data.name?.trim()) {
      throw new Error("Depot name is required");
    }

    if (!data.location?.trim()) {
      throw new Error("Depot location is required");
    }

    if (!data.manager_id) {
      throw new Error("Manager ID is required");
    }

    // Check manager exists
    const manager = await User.findById(data.manager_id);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "SUPERVISOR") {
      throw new Error("Selected user is not a supervisor");
    }

    // Check whether supervisor manages another depot
    const existingManagedDepot = await Depot.findByManagerId(
      Number(data.manager_id),
    );

    if (
      existingManagedDepot &&
      Number(existingManagedDepot.id) !== Number(id)
    ) {
      throw new Error(
        `This supervisor already manages depot: ${existingManagedDepot.name}`,
      );
    }

    // Check duplicate depot code
    const depotWithSameCode = await Depot.findByCode(data.depot_code.trim());

    if (depotWithSameCode && Number(depotWithSameCode.id) !== Number(id)) {
      throw new Error("Depot code already exists");
    }

    // Validate status
    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error("Invalid depot status");
    }

    // Update depot
    await Depot.update(id, {
      depot_code: data.depot_code.trim(),
      name: data.name.trim(),
      location: data.location.trim(),
      manager_id: Number(data.manager_id),
      status: data.status || existingDepot.status,
    });

    return await Depot.findById(id);
  },

  async changeDepotStatus(id, status) {
    const depot = await Depot.findById(id);

    if (!depot) {
      throw new Error("Depot not found");
    }

    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Status must be ACTIVE or INACTIVE");
    }

    await Depot.updateStatus(id, status);

    return await Depot.findById(id);
  },

  async deleteDepot(id) {
    const depot = await Depot.findById(id);

    if (!depot) {
      throw new Error("Depot not found");
    }

    if (Number(depot.total_buses) > 0 || Number(depot.total_drivers) > 0) {
      throw new Error(
        "Cannot delete depot because buses or drivers are assigned to it",
      );
    }

    await Depot.delete(id);

    return {
      message: "Depot deleted successfully",
    };
  },
};

module.exports = depotService;
