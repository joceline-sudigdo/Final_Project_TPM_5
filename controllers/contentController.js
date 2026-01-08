const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Create new content
exports.createContent = async (req, res) => {
  const { title, body } = req.body;

  try {
    const newContent = await prisma.content.create({
      data: {
        title,
        body,
        userId: req.user.userId, 
      },
    });
    res.status(201).json(newContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create content' });
  }
};

// 2. Get all content
exports.getAllContent = async (req, res) => {
  try {
    const contents = await prisma.content.findMany({
      include: { user: { select: { name: true } } } 
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};