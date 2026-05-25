export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export type JobCategory =
  | "Engineering"
  | "Design"
  | "Marketing"
  | "Operations"
  | "People";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: JobType;
  category: JobCategory;
  postedAt: string;
  featured: boolean;
  description: string;
  requirements: string[];
};

export const jobs: Job[] = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    company: "BluePeak Labs",
    location: "Remote",
    salary: "$90k - $125k",
    type: "Full-time",
    category: "Engineering",
    postedAt: "2 days ago",
    featured: true,
    description:
      "Build polished hiring workflows, candidate dashboards, and recruiter tools using React, TypeScript, and modern product engineering practices.",
    requirements: [
      "5+ years of frontend engineering experience",
      "Strong React, TypeScript, and accessibility fundamentals",
      "Experience building production dashboards or SaaS products",
      "Comfort collaborating with design and backend teams",
    ],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    company: "Northstar Careers",
    location: "Colombo",
    salary: "LKR 550k - 850k",
    type: "Full-time",
    category: "Design",
    postedAt: "4 days ago",
    featured: true,
    description:
      "Design candidate-first job discovery experiences and recruiter workflows that make hiring faster, clearer, and more human.",
    requirements: [
      "Portfolio showing end-to-end product design work",
      "Strong interaction design and visual systems thinking",
      "Experience with Figma and design handoff",
      "Ability to test and iterate from user feedback",
    ],
  },
  {
    id: "growth-marketing-manager",
    title: "Growth Marketing Manager",
    company: "TalentBridge",
    location: "Singapore",
    salary: "$70k - $95k",
    type: "Full-time",
    category: "Marketing",
    postedAt: "1 week ago",
    featured: true,
    description:
      "Own acquisition campaigns, employer brand experiments, and lifecycle programs for a fast-growing recruitment marketplace.",
    requirements: [
      "4+ years in growth or performance marketing",
      "Hands-on analytics and campaign optimization experience",
      "Excellent copywriting and experimentation skills",
      "Familiarity with B2B SaaS or marketplace funnels",
    ],
  },
  {
    id: "people-operations-specialist",
    title: "People Operations Specialist",
    company: "VertexWorks",
    location: "Kandy",
    salary: "LKR 260k - 420k",
    type: "Part-time",
    category: "People",
    postedAt: "8 days ago",
    featured: false,
    description:
      "Coordinate candidate communication, onboarding checklists, and hiring operations for distributed teams.",
    requirements: [
      "2+ years in HR, recruiting coordination, or operations",
      "Strong written communication and attention to detail",
      "Experience with applicant tracking systems",
      "Comfort managing multiple active hiring processes",
    ],
  },
  {
    id: "backend-api-engineer",
    title: "Backend API Engineer",
    company: "CloudHarbor",
    location: "Remote",
    salary: "$85k - $115k",
    type: "Contract",
    category: "Engineering",
    postedAt: "10 days ago",
    featured: false,
    description:
      "Create reliable APIs and database models for applications, CV uploads, recruiter notes, and interview scheduling.",
    requirements: [
      "Strong Node.js or server-side TypeScript experience",
      "PostgreSQL schema design and query optimization",
      "Experience with authentication and file uploads",
      "Prisma or Supabase experience is a plus",
    ],
  },
  {
    id: "operations-intern",
    title: "Operations Intern",
    company: "Hirely Studio",
    location: "Galle",
    salary: "LKR 75k - 120k",
    type: "Internship",
    category: "Operations",
    postedAt: "12 days ago",
    featured: false,
    description:
      "Support job listing quality, employer onboarding, and weekly reporting for the HireHub operations team.",
    requirements: [
      "Organized, curious, and comfortable with spreadsheets",
      "Clear written communication",
      "Interest in startups, hiring, or people operations",
      "Available at least 20 hours per week",
    ],
  },
];

export const jobCategories = Array.from(
  new Set(jobs.map((job) => job.category)),
).sort();

export const jobLocations = Array.from(
  new Set(jobs.map((job) => job.location)),
).sort();

export const jobTypes = Array.from(new Set(jobs.map((job) => job.type))).sort();

export function getJobById(id: string) {
  return jobs.find((job) => job.id === id);
}
