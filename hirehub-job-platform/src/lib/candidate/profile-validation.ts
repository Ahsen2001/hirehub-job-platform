import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined));

export const basicProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be 100 characters or less."),
  phone: optionalText.pipe(
    z
      .string()
      .max(30, "Phone must be 30 characters or less.")
      .optional(),
  ),
  address: optionalText.pipe(
    z
      .string()
      .max(180, "Address must be 180 characters or less.")
      .optional(),
  ),
  bio: optionalText.pipe(
    z.string().max(800, "Bio must be 800 characters or less.").optional(),
  ),
});

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill must be at least 2 characters.")
    .max(40, "Skill must be 40 characters or less."),
});

export const skillIdSchema = z.object({
  skillId: z.uuid("Invalid skill id."),
});

export const educationSchema = z.object({
  id: z.uuid("Invalid education id.").optional(),
  institution: z
    .string()
    .trim()
    .min(2, "Institution is required.")
    .max(120, "Institution must be 120 characters or less."),
  degree: z
    .string()
    .trim()
    .min(2, "Degree is required.")
    .max(120, "Degree must be 120 characters or less."),
  fieldOfStudy: optionalText.pipe(
    z
      .string()
      .max(120, "Field of study must be 120 characters or less.")
      .optional(),
  ),
  startDate: optionalDate(),
  endDate: optionalDate(),
  isCurrent: z.boolean().default(false),
  description: optionalText.pipe(
    z
      .string()
      .max(500, "Description must be 500 characters or less.")
      .optional(),
  ),
});

export const workExperienceSchema = z.object({
  id: z.uuid("Invalid work experience id.").optional(),
  company: z
    .string()
    .trim()
    .min(2, "Company is required.")
    .max(120, "Company must be 120 characters or less."),
  title: z
    .string()
    .trim()
    .min(2, "Job title is required.")
    .max(120, "Job title must be 120 characters or less."),
  location: optionalText.pipe(
    z.string().max(120, "Location must be 120 characters or less.").optional(),
  ),
  startDate: optionalDate(),
  endDate: optionalDate(),
  isCurrent: z.boolean().default(false),
  description: optionalText.pipe(
    z
      .string()
      .max(500, "Description must be 500 characters or less.")
      .optional(),
  ),
});

export const recordIdSchema = z.object({
  id: z.uuid("Invalid record id."),
});

export function getFirstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

function optionalDate() {
  return z
    .string()
    .trim()
    .transform((value) => (value ? new Date(value) : undefined))
    .pipe(z.date().optional());
}
