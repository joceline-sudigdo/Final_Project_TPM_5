const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/adminMiddleware");

// Public Route (Admin Login)
router.post("/login", adminController.adminLogin);

// Protected Routes (Must be logged in as Admin)
router.get("/teams", authenticateAdmin, adminController.getAllTeams);
router.put("/teams/:id", authenticateAdmin, adminController.updateTeam);
router.delete("/teams/:id", authenticateAdmin, adminController.deleteTeam);

module.exports = router;
