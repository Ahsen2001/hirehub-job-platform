"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApplicationStatus, JobStatus } from "@/generated/prisma/client";
import {
  applicationSchema,
  getFirstApplicationIssue,
} from "@/lib/candidate/application-validation";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import { uploadCandidateCv } from "@/lib/supabase/storage";

export type ApplyActionState = {
  error?: string;
};

export async function submitApplication(
  _previousState: ApplyActionState,
  formData: FormData,
): Promise<ApplyActionState> {
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    coverLetter: formData.get("coverLetter"),
    useExistingCv: formData.get("useExistingCv") === "on",
  });

  if (!parsed.success) {
    return { error: getFirstApplicationIssue(parsed.error) };
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CANDIDATE") {
    redirect("/unauthorized");
  }

  const prisma = getPrisma();
  const [job, profile, existingApplication] = await Promise.all([
    prisma.job.findFirst({
      where: { id: parsed.data.jobId, status: JobStatus.OPEN },
      select: { id: true, slug: true, title: true },
    }),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { resumeUrl: true },
    }),
    prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: parsed.data.jobId,
          candidateId: user.id,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!job) {
    return { error: "This job is no longer open." };
  }

  if (existingApplication) {
    return { error: "You have already applied to this job." };
  }

  let resumeUrl = parsed.data.useExistingCv ? profile?.resumeUrl : undefined;
  const cvFile = formData.get("cv");

  if (cvFile instanceof File && cvFile.size > 0) {
    try {
      resumeUrl = await uploadCandidateCv(cvFile, user.id);
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { resumeUrl },
        create: {
          userId: user.id,
          firstName: user.name.split(" ")[0] || "Candidate",
          lastName: user.name.split(" ").slice(1).join(" ") || "User",
          resumeUrl,
        },
      });
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload CV. Please try again.",
      };
    }
  }

  if (!resumeUrl) {
    return { error: "Please upload a CV or add one to your profile first." };
  }

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: user.id,
      status: ApplicationStatus.APPLIED,
      coverLetter: parsed.data.coverLetter,
      resumeUrl,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      action: "APPLICATION_SUBMITTED",
      entityType: "Application",
      entityId: application.id,
      metadata: {
        jobId: job.id,
        jobTitle: job.title,
        source: "candidate_apply_flow",
      },
    },
  });

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/dashboard");
  revalidatePath(`/jobs/${job.slug}`);
  redirect("/candidate/applications?submitted=1");
}
