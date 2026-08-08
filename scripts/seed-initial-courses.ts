import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  "C Programming",
  "Python",
  "Java",
  "C++",
  "Web Development Using AI",
  "DevOps",
  "Linux Administration"
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\+\+/g, "plusplus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (const title of courses) {
    await prisma.course.upsert({
      where: { slug: slugify(title) },
      update: {},
      create: {
        title,
        slug: slugify(title),
        shortDesc: `${title} live course for practical beginners.`,
        fullDesc: `${title} includes live classes, recordings, materials, assignments, quizzes, attendance tracking, chat, and certificate eligibility.`,
        category: "Technology",
        difficulty: "BEGINNER",
        priceInPaise: 69_900,
        requirements: ["A laptop or desktop", "Reliable internet", "Willingness to practice"],
        outcomes: ["Build practical foundations", "Complete assignments", "Earn certificate eligibility"],
        published: true
      }
    });
  }

  console.log(`Seeded ${courses.length} initial courses.`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

