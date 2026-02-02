const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admins.findUnique({ where: { username } });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid password" });

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

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalTeams, incompleteTeams, totalParticipants, latestTeam] = await Promise.all([
      prisma.teams.count(),
      prisma.teams.count({
        where: {
          team_leaders: { none: {} }
        }
      }),
      prisma.team_leaders.count(),
      prisma.teams.findFirst({
        orderBy: { created_at: 'desc' },
        select: { created_at: true }
      })
    ]);

    res.json({
      total_teams: totalTeams,
      incomplete_informations: incompleteTeams,
      total_participants: totalParticipants,
      latest_registration: latestTeam?.created_at || null
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getAllTeams = async (req, res) => {
  const { search, sortBy, sortOrder } = req.query;

  try {
    const whereClause = search ? {
      team_name: {
        contains: search
      }
    } : {};

    let orderByClause = {};
    if (sortBy === 'name') {
      orderByClause = { team_name: sortOrder || 'asc' };
    } else if (sortBy === 'date') {
      orderByClause = { created_at: sortOrder || 'desc' };
    } else {
      orderByClause = { created_at: 'desc' };
    }

    const teams = await prisma.teams.findMany({
      where: whereClause,
      include: {
        team_leaders: true,
        activities: { 
          take: 1, 
          orderBy: { created_at: "desc" } 
        },
      },
      orderBy: orderByClause
    });

    const safeTeams = teams.map((team) => {
      const { password, ...rest } = team;
      return {
        ...rest,
        leader: team.team_leaders[0] || null,
        members_count: team.team_leaders.length
      };
    });

    res.json(safeTeams);
  } catch (error) {
    console.error('Get All Teams Error:', error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

exports.getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await prisma.teams.findUnique({
      where: { id: parseInt(id) },
      include: {
        team_leaders: true,
        activities: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const { password, ...safeTeam } = team;
    
    const leader = team.team_leaders[0] || null;
    const members = team.team_leaders.slice(1) || [];

    res.json({
      ...safeTeam,
      leader,
      members
    });
  } catch (error) {
    console.error('Get Team By ID Error:', error);
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
};

exports.updateTeam = async (req, res) => {
  const { id } = req.params;
  const { team_name, is_binusian, password } = req.body;

  try {
    const updateData = {};
    
    if (team_name) updateData.team_name = team_name;
    if (typeof is_binusian === 'boolean') updateData.is_binusian = is_binusian;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedTeam = await prisma.teams.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    const { password: _, ...safeTeam } = updatedTeam;
    res.json({ message: "Team updated", team: safeTeam });
  } catch (error) {
    console.error('Update Team Error:', error);
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.teams.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Team and all its data deleted successfully" });
  } catch (error) {
    console.error('Delete Team Error:', error);
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.getAllParticipants = async (req, res) => {
  const { search, sortBy, sortOrder, team } = req.query;

  try {
    const whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (team) {
      whereClause.teams = {
        team_name: { contains: team }
      };
    }

    let orderByClause = {};
    if (sortBy === 'name') {
      orderByClause = { full_name: sortOrder || 'asc' };
    } else if (sortBy === 'team') {
      orderByClause = { teams: { team_name: sortOrder || 'asc' } };
    } else if (sortBy === 'date') {
      orderByClause = { created_at: sortOrder || 'desc' };
    } else {
      orderByClause = { created_at: 'desc' };
    }

    const participants = await prisma.team_leaders.findMany({
      where: whereClause,
      include: {
        teams: {
          select: {
            id: true,
            team_name: true,
            is_binusian: true
          }
        }
      },
      orderBy: orderByClause
    });

    res.json(participants);
  } catch (error) {
    console.error('Get All Participants Error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

exports.getParticipantById = async (req, res) => {
  const { id } = req.params;

  try {
    const participant = await prisma.team_leaders.findUnique({
      where: { id: parseInt(id) },
      include: {
        teams: true
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json(participant);
  } catch (error) {
    console.error('Get Participant By ID Error:', error);
    res.status(500).json({ error: 'Failed to fetch participant details' });
  }
};

exports.updateParticipant = async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, 
    email, 
    whatsapp_number, 
    line_id, 
    github_id, 
    birth_place, 
    birth_date 
  } = req.body;

  try {
    const updateData = {};
    
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (whatsapp_number) updateData.whatsapp_number = whatsapp_number;
    if (line_id) updateData.line_id = line_id;
    if (github_id) updateData.github_id = github_id;
    if (birth_place) updateData.birth_place = birth_place;
    if (birth_date) updateData.birth_date = new Date(birth_date);

    const updatedParticipant = await prisma.team_leaders.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Participant updated', participant: updatedParticipant });
  } catch (error) {
    console.error('Update Participant Error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteParticipant = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.team_leaders.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Delete Participant Error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
};