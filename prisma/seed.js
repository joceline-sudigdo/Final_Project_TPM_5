const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const adminUsername = "superadmin";
  const adminPassword = "adminpassword123";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admins.upsert({
    where: { username: adminUsername },
    update: { password: hashedPassword },
    create: {
      username: adminUsername,
      password: hashedPassword,
    },
  });

  console.log(`Fixed Admin created: ${admin.username} / ${adminPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
