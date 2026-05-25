"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApplicationStatus,
  InterviewStatus,
  type Role,
} from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  createInterviewSchema,
  getFirstInterviewIssue,
  interviewIdSchema,
  updateInterviewSchema,
} from "@/lib/recruiter/interview-validation";

export type InterviewActionState = {
  error?: string;
};

export async function createInterview(
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const parsed = createInterviewSchema.safeParse({
    applicationId: formData.get("applicationId"),
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
    durationMins: formData.get("durationMins") ?? "30",
    mode: formData.get("mode"),
    meetingUrl: formData.get("meetingUrl"),
    location: formData.get("location"),
    feedback: formData.get("feedback"),
  });

  if (!parsed.success) {
    return { error: getFirstInterviewIssue(parsed.error) };
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
      candidateId: true,
      jobId: true,
      status: true,
      job: { select: { title: true } },
    },
  });

  if (!application) {
    return { error: "Application not found or you do not have access to it." };
  }

  await prisma.$transaction(async (tx) => {
    const interview = await tx.interview.create({
      data: {
        applicationId: application.id,
        interviewerId: recruiter.id,
        title: parsed.data.title,
        scheduledAt: new Date(parsed.data.scheduledAt),
        durationMins: parsed.data.durationMins,
        mode: parsed.data.mode,
        meetingUrl: parsed.data.meetingUrl,
        location: parsed.data.location,
        feedback: parsed.data.feedback,
      },
      select: { id: true },
    });

    await tx.application.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.INTERVIEW },
    });

    await tx.activityLog.create({
      data: {
        actorId: recruiter.id,
        action: "INTERVIEW_CREATED",
        entityType: "Interview",
        entityId: interview.id,
        metadata: {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.jobId,
          jobTitle: application.job.title,
          previousApplicationStatus: application.status,
        },
      },
    });
  });

  revalidateInterviewPages(application.jobId);
  redirect("/recruiter/interviews?created=1");
}

export async function updateInterview(
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const parsed = updateInterviewSchema.safeParse({
    interviewId: formData.get("interviewId"),
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
    durationMins: formData.get("durationMins") ?? "30",
    mode: formData.get("mode"),
    meetingUrl: formData.get("meetingUrl"),
    location: formData.get("location"),
    feedback: formData.get("feedback"),
  });

  if (!parsed.success) {
    return { error: getFirstInterviewIssue(parsed.error) };
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const interview = await findRecruiterInterview(parsed.data.interviewId, recruiter.id);

  if (!interview) {
    return { error: "Interview not found or you do not have access to it." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.interview.update({
      where: { id: interview.id },
      data: {
        title: parsed.data.title,
        scheduledAt: new Date(parsed.data.scheduledAt),
        durationMins: parsed.data.durationMins,
        mode: parsed.data.mode,
        meetingUrl: parsed.data.meetingUrl,
        location: parsed.data.location,
        feedback: parsed.data.feedback,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: recruiter.id,
        action: "INTERVIEW_UPDATED",
        entityType: "Interview",
        entityId: interview.id,
        metadata: {
          applicationId: interview.applicationId,
          jobId: interview.application.jobId,
          jobTitle: interview.application.job.title,
          scheduledAt: parsed.data.scheduledAt,
        },
      },
    });
  });

  revalidateInterviewPages(interview.application.jobId);
  redirect("/recruiter/interviews?updated=1");
}

export async function completeInterview(formData: FormData) {
  const parsed = interviewIdSchema.safeParse({
    interviewId: formData.get("interviewId"),
  });

  if (!parsed.success) {
    redirect("/recruiter/interviews?error=invalid_interview");
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const interview = await findRecruiterInterview(parsed.data.interviewId, recruiter.id);

  if (!interview) {
    redirect("/recruiter/interviews?error=not_found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.interview.update({
      where: { id: interview.id },
      data: { status: InterviewStatus.COMPLETED },
    });

    await tx.activityLog.create({
      data: {
        actorId: recruiter.id,
        action: "INTERVIEW_COMPLETED",
        entityType: "Interview",
        entityId: interview.id,
        metadata: {
          applicationId: interview.applicationId,
          jobId: interview.application.jobId,
          jobTitle: interview.application.job.title,
        },
      },
    });
  });

  revalidateInterviewPages(interview.application.jobId);
  redirect("/recruiter/interviews?completed=1");
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

function findRecruiterInterview(interviewId: string, recruiterId: string) {
  return getPrisma().interview.findFirst({
    where: {
      id: interviewId,
      application: { job: { recruiterId } },
    },
    select: {
      id: true,
      applicationId: true,
      application: {
        select: {
          jobId: true,
          job: { select: { title: true } },
        },
      },
    },
  });
}

function revalidateInterviewPages(jobId: string) {
  revalidatePath("/recruiter/interviews");
  revalidatePath("/recruiter/applications");
  revalidatePath(`/recruiter/jobs/${jobId}/applications`);
  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/dashboard");
}
