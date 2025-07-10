const express = require("express");
const router = express.Router();
const { getWorkshops, createWorkshop, getWorkshopById, updateWorkshop, deleteWorkshop } = require("../controllers/workshops.controller");
const { isAdmin, authenticate } = require("../middleware/auth");
// const { validateWorkshop } = require("../middleware/validation");

router.get("/", getWorkshops);
router.get("/:id",getWorkshopById);
router.post("/",authenticate,isAdmin, createWorkshop);
router.delete("/:id",authenticate,isAdmin,deleteWorkshop)
router.put("/:id",authenticate,isAdmin, updateWorkshop); // Assuming you want to update the workshop with the same function

module.exports = router;
