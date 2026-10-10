
const express = require("express");
const router = express.Router();

const delayController = require("../controllers/delay.controller");

router.get("/", delayController.getAll);
router.get("/:id", delayController.getById);
router.post("/", delayController.create);
router.put("/:id", delayController.update);
router.delete("/:id", delayController.delete);

module.exports = router;