import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, JobType } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@hirehub.local" },
    update: {},
    create: {
      email: "admin@hirehub.local",
      role: Role.ADMIN,
      profile: {
        create: {
          firstName: "HireHub",
          lastName: "Admin",
          headline: "Platform administrator",
        },
      },
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@hirehub.local" },
    update: {},
    create: {
      email: "recruiter@hirehub.local",
      role: Role.RECRUITER,
      profile: {
        create: {
          firstName: "Demo",
          lastName: "Recruiter",
          headline: "Talent acquisition lead",
        },
      },
    },
  });

  const engineering = await prisma.jobCategory.upsert({
    where: { slug: "engineering" },
    update: {},
    create: {
      name: "Engineering",
      slug: "engineering",
      description: "Software engineering and technical roles.",
    },
  });

  const company = await prisma.company.upsert({
    where: { slug: "bluepeak-labs" },
    update: {},
    create: {
      name: "BluePeak Labs",
      slug: "bluepeak-labs",
      industry: "Technology",
      location: "Remote",
      ownerId: admin.id,
      recruiters: {
        connect: { id: recruiter.id },
      },
    },
  });

  await prisma.job.upsert({
    where: {
      companyId_slug: {
        companyId: company.id,
        slug: "senior-frontend-engineer",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      categoryId: engineering.id,
      recruiterId: recruiter.id,
      title: "Senior Frontend Engineer",
      slug: "senior-frontend-engineer",
      description:
        "Build modern candidate and recruiter workflows for HireHub customers.",
      requirements: [
        "Strong React and TypeScript experience",
        "Experience building production SaaS interfaces",
      ],
      responsibilities: [
        "Create accessible frontend experiences",
        "Collaborate with product and backend teams",
      ],
      benefits: ["Remote-friendly team", "Learning budget"],
      location: "Remote",
      salaryMin: 90000,
      salaryMax: 125000,
      type: JobType.FULL_TIME,
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  await prisma.platformSetting.upsert({
    where: { key: "site_name" },
    update: { value: "HireHub" },
    create: {
      key: "site_name",
      value: "HireHub",
      description: "Public platform name.",
      isPublic: true,
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
