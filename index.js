require("dotenv").config();
const adminRoutes = require("./routes/adminRoutes");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const landingRoutes = require("./routes/landingRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/landing", landingRoutes);

// Root Check
app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
