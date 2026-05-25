import { InterviewMode } from "@/generated/prisma/client";
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

const scheduledAt = z
  .string()
  .trim()
  .min(1, "Interview date and time are required.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Choose a valid interview date and time.",
  });

export const createInterviewSchema = z.object({
  applicationId: z.uuid("Choose a valid application."),
  title: z
    .string()
    .trim()
    .min(3, "Interview title must be at least 3 characters.")
    .max(120, "Interview title must be 120 characters or less."),
  scheduledAt,
  durationMins: z.coerce
    .number("Duration must be a number.")
    .int("Duration must be a whole number.")
    .min(15, "Interview duration must be at least 15 minutes.")
    .max(480, "Interview duration must be 480 minutes or less.")
    .default(30),
  mode: z.enum(InterviewMode, "Choose a valid interview mode."),
  meetingUrl: optionalUrl,
  location: optionalText,
  feedback: optionalText,
});

export const updateInterviewSchema = createInterviewSchema
  .omit({ applicationId: true })
  .extend({
    interviewId: z.uuid("Invalid interview id."),
  });

export const interviewIdSchema = z.object({
  interviewId: z.uuid("Invalid interview id."),
});

export function getFirstInterviewIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
