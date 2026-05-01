import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const pool = new Pool({
  connectionString,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const memberPassword = await bcrypt.hash("Member@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { name: "Project Admin", passwordHash: adminPassword, role: Role.ADMIN },
    create: {
      name: "Project Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { name: "Team Member", passwordHash: memberPassword, role: Role.MEMBER },
    create: {
      name: "Team Member",
      email: "member@example.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Demo Product Launch",
      description: "Seeded project for the assignment demo flow.",
      createdById: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: admin.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: member.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: member.id,
    },
  });

  const existingTask = await prisma.task.findFirst({
    where: { title: "Prepare launch checklist", projectId: project.id },
  });

  if (!existingTask) {
    await prisma.task.create({
      data: {
        title: "Prepare launch checklist",
        description: "Set up the initial launch checklist and assign ownership.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        projectId: project.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
