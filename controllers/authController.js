const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { team_name, password, is_binusian } = req.body;

  if (!team_name || !password) {
    return res.status(400).json({ error: 'Team name and password are required' });
  }

  try {
    const existingTeam = await prisma.teams.findUnique({ 
        where: { team_name: team_name } 
    });
    
    if (existingTeam) {
      return res.status(400).json({ error: 'Team name already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeam = await prisma.teams.create({
      data: {
        team_name,
        password: hashedPassword,
        is_binusian: is_binusian || false,
      },
    });

    await prisma.users.create({
      data: {
        team_id: newTeam.id,
        team_name: newTeam.team_name,
        password: hashedPassword
      }
    });

    await prisma.activities.create({
      data: {
        team_id: newTeam.id,
        activity_type: 'register',
        description: 'Team registered successfully',
        ip_address: req.ip || '0.0.0.0',
        user_agent: req.headers['user-agent'] || 'unknown'
      }
    });

    res.status(201).json({ message: 'Team registered!', teamId: newTeam.id });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { team_name, password } = req.body;

  try {
    const team = await prisma.teams.findUnique({ 
        where: { team_name: team_name } 
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const validPassword = await bcrypt.compare(password, team.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { teamId: team.id, teamName: team.team_name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );

    await prisma.users.upsert({
      where: { team_id: team.id },
      update: {
        last_login: new Date()
      },
      create: {
        team_id: team.id,
        team_name: team.team_name,
        password: team.password
      }
    });

    await prisma.activities.create({
        data: {
            team_id: team.id,
            activity_type: 'login',
            description: 'Team logged in successfully',
            ip_address: req.ip || '0.0.0.0',
            user_agent: req.headers['user-agent'] || 'unknown'
        }
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const team = await prisma.teams.findUnique({ 
      where: { id: req.user.teamId },
      include: { team_leaders: true } 
    });
    
    if (!team) {
        return res.status(404).json({ error: 'Team not found' });
    }

    const { password, ...teamData } = team;
    res.json(teamData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};