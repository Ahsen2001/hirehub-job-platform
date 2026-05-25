import { JobStatus, JobType } from "@/generated/prisma/client";
import { z } from "zod";

const optionalSalary = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number("Salary must be a number.")
    .int("Salary must be a whole number.")
    .min(0, "Salary cannot be negative.")
    .optional(),
);

export const recruiterJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Job title must be at least 3 characters.")
      .max(120, "Job title must be 120 characters or less."),
    description: z
      .string()
      .trim()
      .min(40, "Description must be at least 40 characters.")
      .max(5000, "Description must be 5000 characters or less."),
    requirements: z
      .string()
      .trim()
      .min(5, "Add at least one requirement.")
      .max(3000, "Requirements must be 3000 characters or less."),
    salaryMin: optionalSalary,
    salaryMax: optionalSalary,
    salaryCurrency: z
      .string()
      .trim()
      .min(3, "Currency is required.")
      .max(3, "Use a 3-letter currency code.")
      .transform((value) => value.toUpperCase()),
    location: z
      .string()
      .trim()
      .min(2, "Location is required.")
      .max(120, "Location must be 120 characters or less."),
    type: z.enum(JobType, "Choose a valid job type."),
    categoryId: z.uuid("Choose a valid category."),
    companyId: z.uuid("Choose a valid company."),
    status: z.enum(JobStatus, "Choose a valid status."),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "Minimum salary cannot be greater than maximum salary.",
      path: ["salaryMin"],
    },
  );

export const recruiterJobIdSchema = z.object({
  jobId: z.uuid("Invalid job id."),
});

export type RecruiterJobInput = z.infer<typeof recruiterJobSchema>;

export function getFirstRecruiterJobIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
