require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
// This prefixes all routes in authRoutes with /api/auth
// So login becomes: http://localhost:3000/api/auth/login
app.use('/api/auth', authRoutes);

// Root Check
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});