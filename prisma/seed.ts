import { PrismaClient, Role, TaskStatus, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Leader",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Member",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      name: "Carol Viewer",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "Team Website Redesign",
      description: "Redesign the company website with new branding.",
      color: "#6366f1",
    },
  });

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: alice.id, projectId: project.id } },
    update: {},
    create: { userId: alice.id, projectId: project.id, role: Role.LEADER },
  });

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: bob.id, projectId: project.id } },
    update: {},
    create: { userId: bob.id, projectId: project.id, role: Role.MEMBER },
  });

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: carol.id, projectId: project.id } },
    update: {},
    create: { userId: carol.id, projectId: project.id, role: Role.VIEWER },
  });

  const tasks = [
    {
      title: "Design new homepage mockup",
      description: "Create Figma mockups for the homepage.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      assigneeId: bob.id,
      creatorId: alice.id,
      deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      order: 0,
    },
    {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated deployment.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      assigneeId: alice.id,
      creatorId: alice.id,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      order: 0,
    },
    {
      title: "Write component library documentation",
      description: "Document all reusable UI components.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      assigneeId: bob.id,
      creatorId: alice.id,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      order: 1,
    },
    {
      title: "Implement dark mode",
      description: "Add dark mode support using CSS variables.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      assigneeId: bob.id,
      creatorId: bob.id,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      order: 0,
    },
    {
      title: "Performance audit",
      description: "Run Lighthouse audit and fix Core Web Vitals.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      assigneeId: null,
      creatorId: alice.id,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      order: 1,
    },
    {
      title: "SEO meta tags",
      description: "Add Open Graph and Twitter card meta tags.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      assigneeId: null,
      creatorId: alice.id,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      order: 2,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: { ...taskData, projectId: project.id },
    });
  }

  console.log("Seed complete!");
  console.log("alice@example.com / password123 (Leader)");
  console.log("bob@example.com   / password123 (Member)");
  console.log("carol@example.com / password123 (Viewer)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());