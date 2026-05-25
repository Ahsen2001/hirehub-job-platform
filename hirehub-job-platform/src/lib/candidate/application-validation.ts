import { z } from "zod";

export const applicationSchema = z.object({
  jobId: z.uuid("Invalid job id."),
  coverLetter: z
    .string()
    .trim()
    .max(2000, "Cover letter must be 2000 characters or less.")
    .optional(),
  useExistingCv: z.boolean().default(true),
});

export function getFirstApplicationIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
