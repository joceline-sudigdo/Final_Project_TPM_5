const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLandingData = async (req, res) => {
  try {
    const [contents, totalTeams, binusianTeams] = await Promise.all([
      prisma.contents.findMany({
        where: { is_active: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.teams.count(),
      prisma.teams.count({ where: { is_binusian: true } })
    ]);

    const groupedContents = {
      announcements: contents.filter(c => c.content_type === 'announcement'),
      schedules: contents.filter(c => c.content_type === 'schedule'),
      prizes: contents.filter(c => c.content_type === 'prize'),
      rules: contents.filter(c => c.content_type === 'rule'),
      materials: contents.filter(c => c.content_type === 'material')
    };

    res.json({
      contents: groupedContents,
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

exports.getContentByType = async (req, res) => {
  const { type } = req.params;

  const validTypes = ['announcement', 'schedule', 'prize', 'rule', 'material'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  try {
    const contents = await prisma.contents.findMany({
      where: { 
        content_type: type,
        is_active: true 
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(contents);
  } catch (error) {
    console.error('Get Content By Type Error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
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