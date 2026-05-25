import { ApplicationStatus, InterviewMode } from "@/generated/prisma/client";
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

export const applicationStatusUpdateSchema = z
  .object({
    applicationId: z.uuid("Invalid application id."),
    status: z.enum(ApplicationStatus, "Choose a valid status."),
    note: optionalText,
    redirectTo: z.string().trim().min(1).default("/recruiter/applications"),
    interviewTitle: optionalText,
    interviewScheduledAt: optionalText,
    interviewDurationMins: z.coerce
      .number("Duration must be a number.")
      .int("Duration must be a whole number.")
      .min(15, "Interview duration must be at least 15 minutes.")
      .max(480, "Interview duration must be 480 minutes or less.")
      .default(30),
    interviewMode: z.enum(InterviewMode).default(InterviewMode.VIDEO),
    interviewMeetingUrl: optionalUrl,
    interviewLocation: optionalText,
  })
  .refine(
    (data) =>
      data.status !== ApplicationStatus.INTERVIEW ||
      Boolean(data.interviewTitle),
    {
      message: "Interview title is required when moving to Interview.",
      path: ["interviewTitle"],
    },
  )
  .refine(
    (data) =>
      data.status !== ApplicationStatus.INTERVIEW ||
      Boolean(data.interviewScheduledAt),
    {
      message: "Interview date and time are required when moving to Interview.",
      path: ["interviewScheduledAt"],
    },
  )
  .refine(
    (data) =>
      data.status !== ApplicationStatus.INTERVIEW ||
      !Number.isNaN(new Date(data.interviewScheduledAt ?? "").getTime()),
    {
      message: "Choose a valid interview date and time.",
      path: ["interviewScheduledAt"],
    },
  );

export function getFirstApplicationPipelineIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
