"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApplicationStatus,
  InterviewMode,
  type Role,
} from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  applicationStatusUpdateSchema,
  getFirstApplicationPipelineIssue,
} from "@/lib/recruiter/application-validation";

export type ApplicationPipelineActionState = {
  error?: string;
};

export async function updateApplicationStatus(
  _previousState: ApplicationPipelineActionState,
  formData: FormData,
): Promise<ApplicationPipelineActionState> {
  const parsed = applicationStatusUpdateSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    note: formData.get("note"),
    redirectTo: formData.get("redirectTo") ?? "/recruiter/applications",
    interviewTitle: formData.get("interviewTitle"),
    interviewScheduledAt: formData.get("interviewScheduledAt"),
    interviewDurationMins: formData.get("interviewDurationMins") ?? "30",
    interviewMode: formData.get("interviewMode") ?? InterviewMode.VIDEO,
    interviewMeetingUrl: formData.get("interviewMeetingUrl"),
    interviewLocation: formData.get("interviewLocation"),
  });

  if (!parsed.success) {
    return { error: getFirstApplicationPipelineIssue(parsed.error) };
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const application = await prisma.application.findFirst({
    where: {
      id: parsed.data.applicationId,
      job: { recruiterId: recruiter.id },
    },
    select: {
      id: true,
      status: true,
      candidateId: true,
      jobId: true,
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!application) {
    return { error: "Application not found or you do not have access to it." };
  }

  await prisma.$transaction(async (tx) => {
    const interview =
      parsed.data.status === ApplicationStatus.INTERVIEW
        ? await tx.interview.create({
            data: {
              applicationId: application.id,
              interviewerId: recruiter.id,
              title: parsed.data.interviewTitle ?? "Recruiter interview",
              scheduledAt: new Date(parsed.data.interviewScheduledAt ?? ""),
              durationMins: parsed.data.interviewDurationMins,
              mode: parsed.data.interviewMode,
              meetingUrl: parsed.data.interviewMeetingUrl,
              location: parsed.data.interviewLocation,
            },
            select: { id: true },
          })
        : null;

    await tx.application.update({
      where: { id: application.id },
      data: {
        status: parsed.data.status,
        notes:
          parsed.data.status === ApplicationStatus.REJECTED
            ? parsed.data.note
            : undefined,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: recruiter.id,
        action: "APPLICATION_STATUS_UPDATED",
        entityType: "Application",
        entityId: application.id,
        metadata: {
          candidateId: application.candidateId,
          jobId: application.jobId,
          jobTitle: application.job.title,
          previousStatus: application.status,
          nextStatus: parsed.data.status,
          note: parsed.data.note,
          interviewId: interview?.id,
        },
      },
    });
  });

  revalidatePath("/recruiter/applications");
  revalidatePath(`/recruiter/jobs/${application.jobId}/applications`);
  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/dashboard");
  redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?updated=1`);
}

async function requireRecruiter() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ("RECRUITER" satisfies Role)) {
    redirect("/unauthorized");
  }

  return user;
}

function sanitizeRedirect(value: string) {
  return value.startsWith("/recruiter/") ? value : "/recruiter/applications";
}
