const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  try {
    const teamId = req.user.teamId;

    const dashboardData = await prisma.teams.findUnique({
      where: { id: teamId },
      include: {
        team_leaders: true,
        activities: {
          take: 5,
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!dashboardData) {
      return res.status(404).json({ error: 'Team data not found' });
    }

    const { password, ...safeData } = dashboardData;
    res.json(safeData);
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

exports.submitMember = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const {
      role,
      full_name,
      email,
      whatsapp_number,
      line_id,
      github_id,
      birth_place,
      birth_date
    } = req.body;

    if (!role || !full_name || !email || !whatsapp_number || !birth_place || !birth_date) {
      return res.status(400).json({ error: 'Missing required fields: role, full_name, email, whatsapp_number, birth_place, birth_date' });
    }

    const validRoles = ['leader', 'member1', 'member2', 'member3'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: leader, member1, member2, member3' });
    }

    const existingRole = await prisma.team_leaders.findFirst({
      where: {
        team_id: teamId,
        role: role
      }
    });

    if (existingRole) {
      return res.status(400).json({ error: `Role ${role} sudah terisi` });
    }

    const newMember = await prisma.team_leaders.create({
      data: {
        team_id: teamId,
        role,
        full_name,
        email,
        whatsapp_number,
        line_id: line_id || null,
        github_id: github_id || null,
        birth_place,
        birth_date: new Date(birth_date)
      }
    });

    await prisma.activities.create({
      data: {
        team_id: teamId,
        activity_type: 'submit',
        description: `${role} ${full_name} submitted`,
        ip_address: req.ip || '0.0.0.0',
        user_agent: req.headers['user-agent'] || 'unknown'
      }
    });

    res.status(201).json({ message: `${role} submitted successfully`, member: newMember });
  } catch (error) {
    console.error('Submit Member Error:', error);
    res.status(500).json({ error: 'Failed to submit member' });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const teamId = req.user.teamId;
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

    const member = await prisma.team_leaders.findUnique({
      where: { id: parseInt(id) }
    });

    if (!member || member.team_id !== teamId) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (whatsapp_number) updateData.whatsapp_number = whatsapp_number;
    if (line_id) updateData.line_id = line_id;
    if (github_id) updateData.github_id = github_id;
    if (birth_place) updateData.birth_place = birth_place;
    if (birth_date) updateData.birth_date = new Date(birth_date);

    const updatedMember = await prisma.team_leaders.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    await prisma.activities.create({
      data: {
        team_id: teamId,
        activity_type: 'update',
        description: `${updatedMember.role} ${updatedMember.full_name} updated`,
        ip_address: req.ip || '0.0.0.0',
        user_agent: req.headers['user-agent'] || 'unknown'
      }
    });

    res.json({ message: 'Member updated successfully', member: updatedMember });
  } catch (error) {
    console.error('Update Member Error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const { id } = req.params;

    const member = await prisma.team_leaders.findUnique({
      where: { id: parseInt(id) }
    });

    if (!member || member.team_id !== teamId) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await prisma.team_leaders.delete({
      where: { id: parseInt(id) }
    });

    await prisma.activities.create({
      data: {
        team_id: teamId,
        activity_type: 'update',
        description: `${member.role} ${member.full_name} deleted`,
        ip_address: req.ip || '0.0.0.0',
        user_agent: req.headers['user-agent'] || 'unknown'
      }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete Member Error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};

exports.getLeader = async (req, res) => {
  try {
    const teamId = req.user.teamId;

    const leader = await prisma.team_leaders.findFirst({
      where: {
        team_id: teamId,
        role: 'leader'
      }
    });

    if (!leader) {
      return res.status(404).json({ error: 'Leader not found' });
    }

    res.json(leader);
  } catch (error) {
    console.error('Get Leader Error:', error);
    res.status(500).json({ error: 'Failed to fetch leader' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const teamId = req.user.teamId;

    const members = await prisma.team_leaders.findMany({
      where: {
        team_id: teamId,
        role: {
          in: ['member1', 'member2', 'member3']
        }
      },
      orderBy: { role: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Get Members Error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const teamId = req.user.teamId;

    const users = await prisma.team_leaders.findMany({
      where: {
        team_id: teamId
      },
      orderBy: { role: 'asc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};