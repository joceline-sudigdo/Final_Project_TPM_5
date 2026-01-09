const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllContent = async (req, res) => {
  try {
    const contents = await prisma.contents.findMany({
        where: { is_active: true } 
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

exports.createContent = async (req, res) => {
  const { title, description, content_type } = req.body;


  try {
    const newContent = await prisma.contents.create({
      data: {
        title,
        description,
        content_type: content_type || 'announcement', 
        is_active: true
      },
    });
    res.status(201).json(newContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create content' });
  }
};