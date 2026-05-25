"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApplicationStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export async function applyToJob(formData: FormData) {
  const slug = formData.get("slug");

  if (typeof slug !== "string" || slug.length === 0) {
    redirect("/jobs");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/jobs/${slug}`);
  }

  if (user.role !== "CANDIDATE") {
    redirect(`/jobs/${slug}?error=role`);
  }

  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!job) {
    redirect("/jobs");
  }

  await prisma.application.upsert({
    where: {
      jobId_candidateId: {
        jobId: job.id,
        candidateId: user.id,
      },
    },
    update: {},
    create: {
      jobId: job.id,
      candidateId: user.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  revalidatePath(`/jobs/${slug}`);
  revalidatePath("/candidate/dashboard");
  redirect(`/jobs/${slug}?applied=1`);
}
