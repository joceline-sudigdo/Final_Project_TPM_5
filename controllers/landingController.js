const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLandingData = async (req, res) => {
  try {
    const [totalTeams, binusianTeams] = await Promise.all([
      prisma.teams.count(),
      prisma.teams.count({ where: { is_binusian: true } })
    ]);

    res.json({
      statistics: {
        total_teams: totalTeams,
        binusian_teams: binusianTeams,
        non_binusian_teams: totalTeams - binusianTeams
      }
    });
  } catch (error) {
    console.error('Landing Data Error:', error);
    res.status(500).json({ error: 'Failed to fetch landing data' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const [totalTeams, binusianTeams, totalLeaders] = await Promise.all([
      prisma.teams.count(),
      prisma.teams.count({ where: { is_binusian: true } }),
      prisma.team_leaders.count()
    ]);

    res.json({
      total_teams: totalTeams,
      binusian_teams: binusianTeams,
      non_binusian_teams: totalTeams - binusianTeams,
      total_leaders: totalLeaders
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};