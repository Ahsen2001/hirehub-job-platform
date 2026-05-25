import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === null ? undefined : value),
  z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === null ? undefined : value),
  z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .pipe(z.url("Enter a valid URL.").optional()),
);

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.uuid("Choose a valid recruiter owner.").optional(),
);

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(120, "Company name must be 120 characters or less."),
  description: optionalText,
  websiteUrl: optionalUrl,
  logoUrl: optionalUrl,
  industry: optionalText,
  location: optionalText,
  size: optionalText,
  ownerId: optionalUuid,
  isVerified: z.boolean().default(false),
});

export const companyIdSchema = z.object({
  companyId: z.uuid("Invalid company id."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(80, "Category name must be 80 characters or less."),
  description: optionalText,
});

export const categoryIdSchema = z.object({
  categoryId: z.uuid("Invalid category id."),
});

export function getFirstCatalogIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
