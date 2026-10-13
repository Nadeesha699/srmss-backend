const routeService = require("../services/route.service");

const getAllRoutes = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await routeService.getAllRoutes(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRouteById = async (req, res) => {
  try {
    res.json({
      success: true,
      data: await routeService.getRouteById(req.params.id),
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createRoute = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: await routeService.createRoute(req.body),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRoute = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Route updated successfully",
      data: await routeService.updateRoute(req.params.id, req.body),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRouteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const route = await routeService.updateRouteStatus(id, status);

    return res.status(200).json({
      success: true,
      message: "Route status updated successfully.",
      data: route,
    });
  } catch (error) {
    const message = error.message || "Failed to update route status.";

    const statusCode =
      message === "Route not found."
        ? 404
        : message.startsWith("Invalid")
          ? 400
          : 500;

    console.error("Update route status error:", error);

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

const deleteRoute = async (req, res) => {
  try {
    await routeService.deleteRoute(req.params.id);

    res.json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  updateRouteStatus,
  deleteRoute,
};
