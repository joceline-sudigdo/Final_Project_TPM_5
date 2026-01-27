const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// --- ADMIN LOGIN ---
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admins.findUnique({ where: { username } });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid password" });

    // Mark the token role as 'admin'
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
    );

    res.json({ message: "Welcome Admin", token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// --- CRUD PESERTA (TEAMS) ---

// 1. READ: Get All Teams (with their leaders)
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.teams.findMany({
      include: {
        team_leaders: true, // See who is in the team
        activities: { take: 1, orderBy: { created_at: "desc" } }, // See last login
      },
    });

    // Remove passwords from view
    const safeTeams = teams.map((team) => {
      const { password, ...rest } = team;
      return rest;
    });

    res.json(safeTeams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// 2. UPDATE: Edit a Team (e.g., Verify them or Change Name)
exports.updateTeam = async (req, res) => {
  const { id } = req.params; // Get ID from URL
  const { team_name, is_binusian } = req.body;

  try {
    const updatedTeam = await prisma.teams.update({
      where: { id: parseInt(id) },
      data: { team_name, is_binusian },
    });
    res.json({ message: "Team updated", updatedTeam });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// 3. DELETE: Remove a Team (Kick them out)
exports.deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    // Because of 'onDelete: Cascade' in your schema,
    // this also deletes their Leaders and Activities automatically!
    await prisma.teams.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Team and all its data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};
