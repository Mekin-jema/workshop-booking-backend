const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const mockWorkshops = [
  {
    title: "Introduction to Python Programming",
    description: "Learn the basics of Python including variables, loops, and functions. Perfect for absolute beginners.",
    date: new Date("2025-07-20"),
    maxCapacity: 20,
  },
  {
    title: "Full-Stack Web Development with MERN",
    description: "A hands-on workshop covering MongoDB, Express, React, and Node.js to build scalable web apps.",
    date: new Date("2025-08-01"),
    maxCapacity: 25,
  },
  {
    title: "UI/UX Design Bootcamp",
    description: "Explore the principles of good design, prototyping, and Figma in this interactive design workshop.",
    date: new Date("2025-08-10"),
    maxCapacity: 15,
  },
  {
    title: "DevOps Essentials with Docker & CI/CD",
    description: "Learn how to containerize applications with Docker and automate deployments with CI/CD pipelines.",
    date: new Date("2025-08-15"),
    maxCapacity: 18,
  },
  {
    title: "Getting Started with Machine Learning",
    description: "Understand core ML concepts and build simple models using Python libraries like scikit-learn and pandas.",
    date: new Date("2025-08-20"),
    maxCapacity: 22,
  },
  {
    title: "Data Visualization with D3.js and Recharts",
    description: "Create stunning and informative data visualizations using JavaScript libraries like D3 and Recharts.",
    date: new Date("2025-08-25"),
    maxCapacity: 20,
  },
  {
    title: "Next.js & Tailwind CSS Masterclass",
    description: "Build fast, SEO-friendly web apps using Next.js and design them beautifully with Tailwind CSS.",
    date: new Date("2025-08-28"),
    maxCapacity: 25,
  },
  {
    title: "TypeScript for JavaScript Developers",
    description: "Transition from JavaScript to TypeScript to build scalable, maintainable applications.",
    date: new Date("2025-09-01"),
    maxCapacity: 20,
  },
  {
    title: "Backend APIs with Node.js and Express",
    description: "Learn how to build RESTful APIs using Node.js, Express, and PostgreSQL with proper structure and testing.",
    date: new Date("2025-09-05"),
    maxCapacity: 24,
  },
  {
    title: "Cloud Deployment with AWS and Vercel",
    description: "Understand how to deploy modern web applications to AWS EC2, S3, and serverless platforms like Vercel.",
    date: new Date("2025-09-10"),
    maxCapacity: 18,
  },
];

async function main() {
  console.log("🧹 Clearing old data...");
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating users (1 admin + 9 customers)...");

  const users = [];

  // Create hardcoded admin user
  const adminUser = await prisma.user.create({
    data: {
      name: "Mekin Jemal",
      email: "mekinjemal999@gmail.com",
      password: "admin123", // ⚠️ In production, hash this!
      role: "ADMIN",
    },
  });
  users.push(adminUser);

  // Create 9 fake customers
  for (let i = 0; i < 9; i++) {
    const customer = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(), // ⚠️ Hash this in production
        role: "CUSTOMER",
      },
    });
    users.push(customer);
  }

  console.log("📚 Creating 10 real workshops with time slots...");
  for (const data of mockWorkshops) {
    const workshop = await prisma.workshop.create({
      data: {
        ...data,
        isDeleted: false,
        timeSlots: {
          create: Array.from({ length: 3 }).map(() => {
            const startHour = faker.number.int({ min: 9, max: 15 });
            const endHour = startHour + 1;
            return {
              startTime: `${startHour.toString().padStart(2, "0")}:00`,
              endTime: `${endHour.toString().padStart(2, "0")}:00`,
              availableSpots: faker.number.int({ min: 5, max: 15 }),
            };
          }),
        },
      },
      include: { timeSlots: true },
    });

    // Book 2 random customers into random time slots
    for (let j = 0; j < 2; j++) {
      const customer = users[faker.number.int({ min: 1, max: 9 })]; // skip admin at index 0
      const timeSlot = faker.helpers.arrayElement(workshop.timeSlots);

      await prisma.booking.create({
        data: {
          customerId: customer.id,
          workshopId: workshop.id,
          timeSlotId: timeSlot.id,
          status: faker.helpers.arrayElement(["PENDING", "CONFIRMED"]),
          isDeleted: false,
        },
      });
    }
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
