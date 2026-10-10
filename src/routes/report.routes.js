const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getTripStatistics,
  getTripCompletionReport,
  getFuelStatistics,
  getFuelByBus,
  getMaintenanceStatistics,
  getMaintenanceByBus,
  getRoutePerformance,
  getDepotPerformance,
  getDelayReport,
  getVehicleUtilization,
  getDriverWorkload,
} = require("../controllers/report.controller");
const auth = require("../middlewares/auth");

// Dashboard
router.get(
  "/dashboard",
  getDashboardSummary
);

// Trips
router.get(
  "/trips",
  getTripStatistics
);

router.get(
  "/trips/completion",
  getTripCompletionReport
);

// Fuel
router.get(
  "/fuel",
  getFuelStatistics
);

router.get(
  "/fuel/buses",
  getFuelByBus
);

// Maintenance
router.get(
  "/maintenance",
  getMaintenanceStatistics
);

router.get(
  "/maintenance/buses",
  getMaintenanceByBus
);

// Routes
router.get(
  "/routes",
  getRoutePerformance
);

// Depots
router.get(
  "/depots",
  getDepotPerformance
);

// Delays
router.get(
  "/delays",
  getDelayReport
);

// Vehicles
router.get(
  "/vehicles/utilization",
  getVehicleUtilization
);

// Drivers
router.get(
  "/drivers/workload",
  getDriverWorkload
);

module.exports = router;