"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus, type Role } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  getFirstRecruiterJobIssue,
  recruiterJobIdSchema,
  recruiterJobSchema,
  splitLines,
  type RecruiterJobInput,
} from "@/lib/recruiter/job-validation";

export type RecruiterJobActionState = {
  error?: string;
};

export async function createJob(
  _previousState: RecruiterJobActionState,
  formData: FormData,
): Promise<RecruiterJobActionState> {
  const parsed = parseJobForm(formData);

  if (!parsed.success) {
    return { error: getFirstRecruiterJobIssue(parsed.error) };
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const access = await verifyRecruiterAccess(parsed.data.companyId, recruiter.id);

  if (!access) {
    return { error: "You can only create jobs for your assigned company." };
  }

  const category = await prisma.jobCategory.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });

  if (!category) {
    return { error: "Choose a valid category." };
  }

  const job = await prisma.job.create({
    data: {
      ...toJobData(parsed.data),
      slug: await getUniqueJobSlug(parsed.data.title),
      companyId: parsed.data.companyId,
      categoryId: parsed.data.categoryId,
      recruiterId: recruiter.id,
      publishedAt: parsed.data.status === JobStatus.OPEN ? new Date() : null,
    },
    select: { id: true, title: true },
  });

  await prisma.activityLog.create({
    data: {
      actorId: recruiter.id,
      action: "JOB_CREATED",
      entityType: "Job",
      entityId: job.id,
      metadata: {
        title: job.title,
        companyId: parsed.data.companyId,
        status: parsed.data.status,
      },
    },
  });

  revalidateRecruiterJobs();
  redirect("/recruiter/jobs?created=1");
}

export async function updateJob(
  _previousState: RecruiterJobActionState,
  formData: FormData,
): Promise<RecruiterJobActionState> {
  const idParsed = recruiterJobIdSchema.safeParse({
    jobId: formData.get("jobId"),
  });
  const parsed = parseJobForm(formData);

  if (!idParsed.success) {
    return { error: getFirstRecruiterJobIssue(idParsed.error) };
  }

  if (!parsed.success) {
    return { error: getFirstRecruiterJobIssue(parsed.error) };
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id: idParsed.data.jobId, recruiterId: recruiter.id },
    select: { id: true, slug: true, title: true },
  });

  if (!job) {
    return { error: "Job not found or you do not have access to edit it." };
  }

  const access = await verifyRecruiterAccess(parsed.data.companyId, recruiter.id);

  if (!access) {
    return { error: "You can only assign jobs to your assigned company." };
  }

  const category = await prisma.jobCategory.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });

  if (!category) {
    return { error: "Choose a valid category." };
  }

  const titleChanged = normalizeSlug(job.title) !== normalizeSlug(parsed.data.title);
  const nextSlug = titleChanged
    ? await getUniqueJobSlug(parsed.data.title, job.id)
    : job.slug;

  await prisma.job.update({
    where: { id: job.id },
    data: {
      ...toJobData(parsed.data),
      slug: nextSlug,
      companyId: parsed.data.companyId,
      categoryId: parsed.data.categoryId,
      publishedAt:
        parsed.data.status === JobStatus.OPEN
          ? new Date()
          : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: recruiter.id,
      action: "JOB_UPDATED",
      entityType: "Job",
      entityId: job.id,
      metadata: {
        previousTitle: job.title,
        nextTitle: parsed.data.title,
        status: parsed.data.status,
      },
    },
  });

  revalidateRecruiterJobs();
  redirect("/recruiter/jobs?updated=1");
}

export async function toggleJobStatus(formData: FormData) {
  const parsed = recruiterJobIdSchema.safeParse({
    jobId: formData.get("jobId"),
  });

  if (!parsed.success) {
    redirect("/recruiter/jobs?error=invalid_job");
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id: parsed.data.jobId, recruiterId: recruiter.id },
    select: { id: true, title: true, status: true },
  });

  if (!job) {
    redirect("/recruiter/jobs?error=not_found");
  }

  const nextStatus =
    job.status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === JobStatus.OPEN ? new Date() : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: recruiter.id,
      action: "JOB_STATUS_CHANGED",
      entityType: "Job",
      entityId: job.id,
      metadata: {
        title: job.title,
        previousStatus: job.status,
        nextStatus,
      },
    },
  });

  revalidateRecruiterJobs();
  redirect("/recruiter/jobs?status=1");
}

export async function deleteJob(formData: FormData) {
  const parsed = recruiterJobIdSchema.safeParse({
    jobId: formData.get("jobId"),
  });

  if (!parsed.success) {
    redirect("/recruiter/jobs?error=invalid_job");
  }

  const recruiter = await requireRecruiter();
  const prisma = getPrisma();
  const job = await prisma.job.findFirst({
    where: { id: parsed.data.jobId, recruiterId: recruiter.id },
    select: {
      id: true,
      title: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) {
    redirect("/recruiter/jobs?error=not_found");
  }

  if (job._count.applications > 0) {
    redirect("/recruiter/jobs?error=has_applications");
  }

  await prisma.job.delete({ where: { id: job.id } });
  await prisma.activityLog.create({
    data: {
      actorId: recruiter.id,
      action: "JOB_DELETED",
      entityType: "Job",
      entityId: job.id,
      metadata: { title: job.title },
    },
  });

  revalidateRecruiterJobs();
  redirect("/recruiter/jobs?deleted=1");
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

async function verifyRecruiterAccess(companyId: string, recruiterId: string) {
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { recruiterCompanyId: true },
  });

  return prisma.company.findFirst({
    where: {
      id: companyId,
      OR: [
        { ownerId: recruiterId },
        ...(dbUser?.recruiterCompanyId
          ? [{ id: dbUser.recruiterCompanyId }]
          : []),
      ],
    },
    select: { id: true },
  });
}

function parseJobForm(formData: FormData) {
  return recruiterJobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    salaryMin: formData.get("salaryMin"),
    salaryMax: formData.get("salaryMax"),
    salaryCurrency: formData.get("salaryCurrency"),
    location: formData.get("location"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    companyId: formData.get("companyId"),
    status: formData.get("status"),
  });
}

function toJobData(data: RecruiterJobInput) {
  return {
    title: data.title,
    description: data.description,
    requirements: splitLines(data.requirements),
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    salaryCurrency: data.salaryCurrency,
    location: data.location,
    type: data.type,
    status: data.status,
  };
}

async function getUniqueJobSlug(title: string, currentJobId?: string) {
  const prisma = getPrisma();
  const base = normalizeSlug(title);
  let slug = base;
  let attempt = 2;

  while (
    await prisma.job.findFirst({
      where: {
        slug,
        ...(currentJobId ? { NOT: { id: currentJobId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${attempt}`;
    attempt += 1;
  }

  return slug;
}

function normalizeSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "job"
  );
}

function revalidateRecruiterJobs() {
  revalidatePath("/recruiter/jobs");
  revalidatePath("/recruiter/dashboard");
  revalidatePath("/jobs");
}
