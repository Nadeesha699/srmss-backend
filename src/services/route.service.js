const RouteModel = require("../models/route.model");

const routeService = {
  async getAllRoutes() {
    return await RouteModel.findAll();
  },

  async getRouteById(id) {
    const route = await RouteModel.findById(id);

    if (!route) {
      throw new Error("Route not found");
    }

    return route;
  },

  async createRoute(data) {
    if (
      !data.route_code ||
      !data.name ||
      !data.start_point ||
      !data.end_point ||
      !data.distance_km
    ) {
      throw new Error("All route fields are required");
    }

    const existing = await RouteModel.findByCode(
      data.route_code
    );

    if (existing) {
      throw new Error("Route code already exists");
    }

    const id = await RouteModel.create(data);

    return await RouteModel.findById(id);
  },

  async updateRoute(id, data) {
    const route = await RouteModel.findById(id);

    if (!route) {
      throw new Error("Route not found");
    }

    await RouteModel.update(id, data);

    return await RouteModel.findById(id);
  },

  async deleteRoute(id) {
    const route = await RouteModel.findById(id);

    if (!route) {
      throw new Error("Route not found");
    }

    await RouteModel.delete(id);

    return true;
  },
};

module.exports = routeService;