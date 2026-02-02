const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/adminMiddleware");

// Public Route (Admin Login)
router.post("/login", adminController.adminLogin);

// Protected Routes (Must be logged in as Admin)
router.get("/stats", authenticateAdmin, adminController.getDashboardStats);

router.get("/teams", authenticateAdmin, adminController.getAllTeams);
router.get("/teams/:id", authenticateAdmin, adminController.getTeamById);
router.put("/teams/:id", authenticateAdmin, adminController.updateTeam);
router.delete("/teams/:id", authenticateAdmin, adminController.deleteTeam);

router.get("/participants", authenticateAdmin, adminController.getAllParticipants);
router.get("/participants/:id", authenticateAdmin, adminController.getParticipantById);
router.put("/participants/:id", authenticateAdmin, adminController.updateParticipant);
router.delete("/participants/:id", authenticateAdmin, adminController.deleteParticipant);

module.exports = router;