const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(process.env.DATABASE_URL?.replace("file:", "") || "dev.db");
const adapter = new PrismaBetterSqlite(db);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("caramel76", 10);

    const admin = await prisma.user.upsert({
      where: { email: "guyro76@gmail.com" },
      update: {
        password: hashedPassword,
        role: "admin",
      },
      create: {
        email: "guyro76@gmail.com",
        name: "גיא רוזנברג",
        password: hashedPassword,
        role: "admin",
        onboardingComplete: true,
      },
    });

    console.log("✅ Admin created:", admin.email, "Password: caramel76");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
