// prisma/seed.ts
import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean existing data ──────────────────────────────────
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ── Create Users ─────────────────────────────────────────
const hashedPassword = await bcrypt.hash("password123", 12);

const arjun = await prisma.user.create({
  data: {
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: hashedPassword,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
  },
});

const priya = await prisma.user.create({
  data: {
    name: "Priya Sharma",
    email: "priya@example.com",
    password: hashedPassword,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
  },
});

const rohan = await prisma.user.create({
  data: {
    name: "Rohan Verma",
    email: "rohan@example.com",
    password: hashedPassword,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=rohan",
  },
});

// ── Create Projects ───────────────────────────────────────
const project1 = await prisma.project.create({
  data: {
    name: "Ethara Admin Dashboard",
    description: "Internal dashboard for managing projects and analytics",
    color: "#6366f1",
    creatorId: arjun.id,
    members: {
      create: [
        { userId: arjun.id, role: Role.ADMIN },
        { userId: priya.id, role: Role.MEMBER },
        { userId: rohan.id, role: Role.MEMBER },
      ],
    },
  },
});

const project2 = await prisma.project.create({
  data: {
    name: "Food Delivery App",
    description: "Building new customer-facing features for the app",
    color: "#f97316",
    creatorId: priya.id,
    members: {
      create: [
        { userId: priya.id, role: Role.ADMIN },
        { userId: arjun.id, role: Role.MEMBER },
      ],
    },
  },
});

// ── Create Tags ───────────────────────────────────────────
const tagBug = await prisma.tag.create({
  data: { name: "bug", color: "#ef4444" },
});

const tagFeature = await prisma.tag.create({
  data: { name: "feature", color: "#8b5cf6" },
});

const tagUrgent = await prisma.tag.create({
  data: { name: "urgent", color: "#f97316" },
});

const tagUI = await prisma.tag.create({
  data: { name: "ui", color: "#06b6d4" },
});

// ── Create Tasks for Project 1 ────────────────────────────
const task1 = await prisma.task.create({
  data: {
    title: "Build analytics overview page",
    description: "Create dashboard cards and charts for admin analytics",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    projectId: project1.id,
    creatorId: arjun.id,
    assigneeId: priya.id,
    tags: { create: [{ tagId: tagUI.id }] },
  },
});

const task2 = await prisma.task.create({
  data: {
    title: "Setup Railway deployment",
    description: "Configure deployment pipeline and environment variables",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    projectId: project1.id,
    creatorId: arjun.id,
    assigneeId: rohan.id,
    tags: { create: [{ tagId: tagFeature.id }] },
  },
});

const task3 = await prisma.task.create({
  data: {
    title: "Fix login redirect issue",
    description: "Users are not redirected correctly after login",
    status: TaskStatus.TODO,
    priority: TaskPriority.URGENT,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    projectId: project1.id,
    creatorId: priya.id,
    assigneeId: rohan.id,
    tags: {
      create: [{ tagId: tagBug.id }, { tagId: tagUrgent.id }],
    },
  },
});

await prisma.task.create({
  data: {
    title: "Write API documentation",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    projectId: project1.id,
    creatorId: arjun.id,
    assigneeId: arjun.id,
  },
});

// ── Create Tasks for Project 2 ────────────────────────────
await prisma.task.create({
  data: {
    title: "Add live order tracking",
    description: "Implement real-time order tracking using sockets",
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    projectId: project2.id,
    creatorId: priya.id,
    assigneeId: arjun.id,
    tags: { create: [{ tagId: tagFeature.id }] },
  },
});

await prisma.task.create({
  data: {
    title: "Implement dark mode",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: project2.id,
    creatorId: priya.id,
    assigneeId: priya.id,
    tags: { create: [{ tagId: tagUI.id }] },
  },
});

// ── Create Comments ───────────────────────────────────────
await prisma.comment.create({
  data: {
    content: "Started working on the dashboard charts, will push updates tonight.",
    taskId: task1.id,
    authorId: priya.id,
  },
});

await prisma.comment.create({
  data: {
    content: "Looks good so far, make sure mobile responsiveness is handled.",
    taskId: task1.id,
    authorId: arjun.id,
  },
});

await prisma.comment.create({
  data: {
    content: "This issue is affecting all users after login, needs urgent fix.",
    taskId: task3.id,
    authorId: arjun.id,
  },
});

console.log("✅ Seeding complete!");
console.log("\n📧 Test Accounts (password: password123)");
console.log("   arjun@example.com  — Admin on Ethara Dashboard");
console.log("   priya@example.com  — Admin on Food Delivery App");
console.log("   rohan@example.com  — Member");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });