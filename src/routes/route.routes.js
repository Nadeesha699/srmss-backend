const express = require("express");
const router = express.Router();
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  updateRouteStatus,
  deleteRoute,
} = require("../controllers/route.controller");
const auth = require("../middlewares/auth");

router.get("/", getAllRoutes);
router.get("/:id", getRouteById);
router.post("/", createRoute);
router.put("/:id", updateRoute);
router.put("/status/:id", updateRouteStatus);
router.delete("/:id", deleteRoute);

module.exports = router;

