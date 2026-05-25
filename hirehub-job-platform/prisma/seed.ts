import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ApplicationStatus,
  InterviewMode,
  InterviewStatus,
  JobStatus,
  JobType,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

const seedUsers = [
  {
    email: "admin@careerconnect.com",
    password: "Admin@123",
    role: Role.ADMIN,
    firstName: "Admin",
    lastName: "User",
    headline: "HireHub platform administrator",
    location: "Colombo",
  },
  {
    email: "recruiter@careerconnect.com",
    password: "Recruiter@123",
    role: Role.RECRUITER,
    firstName: "Recruiter",
    lastName: "User",
    headline: "Senior recruiter at BluePeak Labs",
    location: "Colombo",
  },
  {
    email: "candidate@careerconnect.com",
    password: "Candidate@123",
    role: Role.CANDIDATE,
    firstName: "Candidate",
    lastName: "User",
    headline: "Frontend developer seeking product teams",
    location: "Remote",
  },
  {
    email: "maya.fernando@example.com",
    password: "Candidate@123",
    role: Role.CANDIDATE,
    firstName: "Maya",
    lastName: "Fernando",
    headline: "Product designer focused on hiring workflows",
    location: "Kandy",
  },
  {
    email: "arun.perera@example.com",
    password: "Candidate@123",
    role: Role.CANDIDATE,
    firstName: "Arun",
    lastName: "Perera",
    headline: "Backend engineer with PostgreSQL experience",
    location: "Galle",
  },
] as const;

const categories = [
  ["Engineering", "engineering"],
  ["Design", "design"],
  ["Marketing", "marketing"],
  ["Operations", "operations"],
  ["People", "people"],
] as const;

const companies = [
  {
    name: "BluePeak Labs",
    slug: "bluepeak-labs",
    industry: "Technology",
    location: "Remote",
    size: "51-200",
    description:
      "A product engineering studio building workflow software for modern teams.",
    websiteUrl: "https://bluepeak.example.com",
  },
  {
    name: "Northstar Careers",
    slug: "northstar-careers",
    industry: "Recruitment",
    location: "Colombo",
    size: "11-50",
    description:
      "A specialist recruiting firm connecting companies with design and product talent.",
    websiteUrl: "https://northstar.example.com",
  },
  {
    name: "TalentBridge Global",
    slug: "talentbridge-global",
    industry: "Marketplace",
    location: "Singapore",
    size: "201-500",
    description:
      "A regional hiring marketplace for high-growth technology companies.",
    websiteUrl: "https://talentbridge.example.com",
  },
] as const;

const jobs = [
  {
    title: "Senior Frontend Engineer",
    slug: "senior-frontend-engineer",
    companySlug: "bluepeak-labs",
    categorySlug: "engineering",
    type: JobType.FULL_TIME,
    location: "Remote",
    salaryMin: 90000,
    salaryMax: 125000,
    isFeatured: true,
  },
  {
    title: "Backend API Engineer",
    slug: "backend-api-engineer",
    companySlug: "bluepeak-labs",
    categorySlug: "engineering",
    type: JobType.CONTRACT,
    location: "Remote",
    salaryMin: 85000,
    salaryMax: 115000,
    isFeatured: true,
  },
  {
    title: "Product Designer",
    slug: "product-designer",
    companySlug: "northstar-careers",
    categorySlug: "design",
    type: JobType.FULL_TIME,
    location: "Colombo",
    salaryMin: 42000,
    salaryMax: 68000,
    isFeatured: true,
  },
  {
    title: "Growth Marketing Manager",
    slug: "growth-marketing-manager",
    companySlug: "talentbridge-global",
    categorySlug: "marketing",
    type: JobType.FULL_TIME,
    location: "Singapore",
    salaryMin: 70000,
    salaryMax: 95000,
    isFeatured: false,
  },
  {
    title: "People Operations Specialist",
    slug: "people-operations-specialist",
    companySlug: "northstar-careers",
    categorySlug: "people",
    type: JobType.PART_TIME,
    location: "Kandy",
    salaryMin: 18000,
    salaryMax: 32000,
    isFeatured: false,
  },
  {
    title: "Recruitment Coordinator",
    slug: "recruitment-coordinator",
    companySlug: "northstar-careers",
    categorySlug: "operations",
    type: JobType.FULL_TIME,
    location: "Colombo",
    salaryMin: 24000,
    salaryMax: 38000,
    isFeatured: false,
  },
  {
    title: "Remote QA Analyst",
    slug: "remote-qa-analyst",
    companySlug: "bluepeak-labs",
    categorySlug: "engineering",
    type: JobType.REMOTE,
    location: "Remote",
    salaryMin: 42000,
    salaryMax: 62000,
    isFeatured: false,
  },
  {
    title: "Operations Intern",
    slug: "operations-intern",
    companySlug: "talentbridge-global",
    categorySlug: "operations",
    type: JobType.INTERNSHIP,
    location: "Galle",
    salaryMin: 6000,
    salaryMax: 10000,
    isFeatured: false,
  },
] as const;

const skillNames = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Figma",
  "Recruiting",
  "Communication",
  "Product Design",
  "Marketing Analytics",
] as const;

async function main() {
  console.log("Seeding HireHub database...");

  const passwordHashes = new Map<string, string>();
  for (const user of seedUsers) {
    passwordHashes.set(user.email, await bcrypt.hash(user.password, SALT_ROUNDS));
  }

  const admin = await upsertUser(seedUsers[0], passwordHashes);
  const recruiter = await upsertUser(seedUsers[1], passwordHashes);
  const candidateOne = await upsertUser(seedUsers[2], passwordHashes);
  const candidateTwo = await upsertUser(seedUsers[3], passwordHashes);
  const candidateThree = await upsertUser(seedUsers[4], passwordHashes);

  const categoryBySlug = new Map<string, { id: string }>();
  for (const [name, slug] of categories) {
    const category = await prisma.jobCategory.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
        description: `${name} roles available on HireHub.`,
      },
      select: { id: true },
    });
    categoryBySlug.set(slug, category);
  }

  const companyBySlug = new Map<string, { id: string }>();
  for (const companyInput of companies) {
    const company = await prisma.company.upsert({
      where: { slug: companyInput.slug },
      update: {
        name: companyInput.name,
        industry: companyInput.industry,
        location: companyInput.location,
        size: companyInput.size,
        description: companyInput.description,
        websiteUrl: companyInput.websiteUrl,
        ownerId: admin.id,
        isVerified: true,
      },
      create: {
        ...companyInput,
        ownerId: admin.id,
        isVerified: true,
      },
      select: { id: true },
    });
    companyBySlug.set(companyInput.slug, company);
  }

  await prisma.user.update({
    where: { id: recruiter.id },
    data: { recruiterCompanyId: companyBySlug.get("bluepeak-labs")?.id },
  });

  const skillByName = new Map<string, { id: string }>();
  for (const name of skillNames) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    skillByName.set(name, skill);
  }

  await refreshCandidateProfile(candidateOne.id, [
    "React",
    "TypeScript",
    "Prisma",
    "Communication",
  ]);
  await refreshCandidateProfile(candidateTwo.id, [
    "Figma",
    "Product Design",
    "Communication",
  ]);
  await refreshCandidateProfile(candidateThree.id, [
    "Node.js",
    "PostgreSQL",
    "Prisma",
  ]);

  const jobBySlug = new Map<string, { id: string }>();
  for (const jobInput of jobs) {
    const company = companyBySlug.get(jobInput.companySlug);
    const category = categoryBySlug.get(jobInput.categorySlug);

    if (!company || !category) {
      throw new Error(`Missing company or category for ${jobInput.slug}`);
    }

    const job = await prisma.job.upsert({
      where: {
        companyId_slug: {
          companyId: company.id,
          slug: jobInput.slug,
        },
      },
      update: {
        title: jobInput.title,
        categoryId: category.id,
        recruiterId: recruiter.id,
        location: jobInput.location,
        salaryMin: jobInput.salaryMin,
        salaryMax: jobInput.salaryMax,
        type: jobInput.type,
        status: JobStatus.OPEN,
        isFeatured: jobInput.isFeatured,
        publishedAt: new Date(),
      },
      create: {
        companyId: company.id,
        categoryId: category.id,
        recruiterId: recruiter.id,
        title: jobInput.title,
        slug: jobInput.slug,
        description: `${jobInput.title} role at HireHub partner ${jobInput.companySlug}.`,
        responsibilities: [
          "Collaborate with cross-functional hiring teams",
          "Deliver high-quality work in a fast-moving environment",
          "Communicate progress clearly with stakeholders",
        ],
        requirements: [
          "Relevant professional experience",
          "Strong communication and ownership",
          "Comfort working with distributed teams",
        ],
        benefits: [
          "Flexible work options",
          "Learning budget",
          "Health and wellness support",
        ],
        location: jobInput.location,
        salaryMin: jobInput.salaryMin,
        salaryMax: jobInput.salaryMax,
        salaryCurrency: jobInput.location === "Singapore" ? "SGD" : "USD",
        type: jobInput.type,
        status: JobStatus.OPEN,
        isFeatured: jobInput.isFeatured,
        publishedAt: new Date(),
      },
      select: { id: true },
    });
    jobBySlug.set(jobInput.slug, job);
  }

  await recreateApplicationsAndInterviews({
    recruiterId: recruiter.id,
    candidateIds: [candidateOne.id, candidateTwo.id, candidateThree.id],
    jobBySlug,
  });

  await recreateActivityLogs({
    adminId: admin.id,
    recruiterId: recruiter.id,
    candidateId: candidateOne.id,
  });

  await seedPlatformSettings();

  console.log("HireHub seed completed.");

  async function refreshCandidateProfile(userId: string, profileSkills: string[]) {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      select: { id: true },
    });

    await prisma.education.deleteMany({ where: { profileId: profile.id } });
    await prisma.workExperience.deleteMany({ where: { profileId: profile.id } });

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        bio: "Seed candidate profile ready for testing applications and recruiter review.",
        resumeUrl: "https://example.com/resumes/sample-cv.pdf",
        skills: {
          set: profileSkills
            .map((name) => skillByName.get(name))
            .filter((skill): skill is { id: string } => Boolean(skill)),
        },
      },
    });

    await prisma.education.createMany({
      data: [
        {
          profileId: profile.id,
          institution: "University of Colombo",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startDate: new Date("2017-01-01"),
          endDate: new Date("2021-12-31"),
          description: "Core coursework in software engineering and systems.",
        },
      ],
    });

    await prisma.workExperience.createMany({
      data: [
        {
          profileId: profile.id,
          company: "DemoTech Solutions",
          title: "Associate Specialist",
          location: "Remote",
          startDate: new Date("2022-01-01"),
          isCurrent: true,
          description:
            "Worked on customer-facing product improvements and team workflows.",
        },
      ],
    });
  }
}

async function upsertUser(
  user: (typeof seedUsers)[number],
  passwordHashes: Map<string, string>,
) {
  const passwordHash = passwordHashes.get(user.email);

  if (!passwordHash) {
    throw new Error(`Missing password hash for ${user.email}`);
  }

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      passwordHash,
      role: user.role,
      isActive: true,
      profile: {
        upsert: {
          update: {
            firstName: user.firstName,
            lastName: user.lastName,
            headline: user.headline,
            location: user.location,
          },
          create: {
            firstName: user.firstName,
            lastName: user.lastName,
            headline: user.headline,
            location: user.location,
          },
        },
      },
    },
    create: {
      email: user.email,
      passwordHash,
      role: user.role,
      isActive: true,
      profile: {
        create: {
          firstName: user.firstName,
          lastName: user.lastName,
          headline: user.headline,
          location: user.location,
        },
      },
    },
  });
}

async function recreateApplicationsAndInterviews({
  recruiterId,
  candidateIds,
  jobBySlug,
}: {
  recruiterId: string;
  candidateIds: string[];
  jobBySlug: Map<string, { id: string }>;
}) {
  await prisma.interview.deleteMany({
    where: {
      application: {
        candidateId: { in: candidateIds },
      },
    },
  });

  await prisma.application.deleteMany({
    where: {
      candidateId: { in: candidateIds },
    },
  });

  const samples = [
    {
      jobSlug: "senior-frontend-engineer",
      candidateId: candidateIds[0],
      status: ApplicationStatus.APPLIED,
    },
    {
      jobSlug: "product-designer",
      candidateId: candidateIds[1],
      status: ApplicationStatus.SHORTLISTED,
    },
    {
      jobSlug: "backend-api-engineer",
      candidateId: candidateIds[2],
      status: ApplicationStatus.INTERVIEW,
    },
    {
      jobSlug: "growth-marketing-manager",
      candidateId: candidateIds[0],
      status: ApplicationStatus.OFFERED,
    },
    {
      jobSlug: "remote-qa-analyst",
      candidateId: candidateIds[1],
      status: ApplicationStatus.REJECTED,
    },
  ] as const;

  for (const sample of samples) {
    const job = jobBySlug.get(sample.jobSlug);

    if (!job) {
      throw new Error(`Missing seeded job ${sample.jobSlug}`);
    }

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: sample.candidateId,
        status: sample.status,
        coverLetter:
          "I am excited to apply through HireHub and discuss how my experience fits this role.",
        resumeUrl: "https://example.com/resumes/sample-cv.pdf",
        expectedSalary: 75000,
      },
    });

    if (
      sample.status === ApplicationStatus.INTERVIEW ||
      sample.status === ApplicationStatus.SHORTLISTED
    ) {
      await prisma.interview.create({
        data: {
          applicationId: application.id,
          interviewerId: recruiterId,
          title: "Initial hiring conversation",
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
          durationMins: 45,
          mode: InterviewMode.VIDEO,
          status: InterviewStatus.SCHEDULED,
          meetingUrl: "https://meet.example.com/hirehub-demo",
        },
      });
    }
  }
}

async function recreateActivityLogs({
  adminId,
  recruiterId,
  candidateId,
}: {
  adminId: string;
  recruiterId: string;
  candidateId: string;
}) {
  await prisma.activityLog.deleteMany({
    where: {
      action: {
        in: ["USER_LOGIN", "JOB_CREATED", "APPLICATION_SUBMITTED"],
      },
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: adminId,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: adminId,
        metadata: { source: "seed" },
      },
      {
        actorId: recruiterId,
        action: "JOB_CREATED",
        entityType: "Job",
        metadata: { source: "seed", count: 8 },
      },
      {
        actorId: candidateId,
        action: "APPLICATION_SUBMITTED",
        entityType: "Application",
        metadata: { source: "seed" },
      },
    ],
  });
}

async function seedPlatformSettings() {
  const settings = [
    {
      key: "site_name",
      value: "HireHub",
      description: "Public platform name.",
      isPublic: true,
    },
    {
      key: "applications_enabled",
      value: true,
      description: "Controls whether candidates can submit applications.",
      isPublic: true,
    },
    {
      key: "cv_upload_bucket",
      value: "resumes",
      description: "Supabase Storage bucket for CV uploads.",
      isPublic: false,
    },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
      },
      create: setting,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
