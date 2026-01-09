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