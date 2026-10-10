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
      data: await routeService.getRouteById(
        req.params.id
      ),
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
      data: await routeService.updateRoute(
        req.params.id,
        req.body
      ),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
  deleteRoute,
};