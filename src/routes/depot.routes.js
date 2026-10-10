const express = require("express");
const router = express.Router();
const {
  getAllDepots,
  getDepotById,
  createDepot,
  updateDepot,
  changeDepotStatus,
  deleteDepot,
} = require("../controllers/depot.controller");
const auth = require("../middlewares/auth");


router.get("/", getAllDepots);
router.get("/:id", getDepotById);
router.post("/", createDepot);
router.put("/:id", updateDepot);
router.patch("/:id/status", changeDepotStatus);
router.delete("/:id", deleteDepot);

module.exports = router;