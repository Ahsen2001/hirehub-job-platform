"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus, type Role } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  companyIdSchema,
  companySchema,
  getFirstCatalogIssue,
} from "@/lib/admin/catalog-validation";

export type CompanyActionState = {
  error?: string;
};

export async function createCompany(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const parsed = parseCompanyForm(formData);

  if (!parsed.success) {
    return { error: getFirstCatalogIssue(parsed.error) };
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const company = await prisma.company.create({
    data: {
      ...parsed.data,
      slug: await getUniqueCompanySlug(parsed.data.name),
    },
    select: { id: true, name: true },
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "COMPANY_CREATED",
      entityType: "Company",
      entityId: company.id,
      metadata: { name: company.name, ownerId: parsed.data.ownerId },
    },
  });

  revalidateAdminCatalogPages();
  redirect("/admin/companies?created=1");
}

export async function updateCompany(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const idParsed = companyIdSchema.safeParse({
    companyId: formData.get("companyId"),
  });
  const parsed = parseCompanyForm(formData);

  if (!idParsed.success) {
    return { error: getFirstCatalogIssue(idParsed.error) };
  }

  if (!parsed.success) {
    return { error: getFirstCatalogIssue(parsed.error) };
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const current = await prisma.company.findUnique({
    where: { id: idParsed.data.companyId },
    select: { id: true, name: true, slug: true },
  });

  if (!current) {
    return { error: "Company not found." };
  }

  const nextSlug =
    normalizeSlug(current.name) === normalizeSlug(parsed.data.name)
      ? current.slug
      : await getUniqueCompanySlug(parsed.data.name, current.id);

  await prisma.company.update({
    where: { id: current.id },
    data: {
      ...parsed.data,
      slug: nextSlug,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "COMPANY_UPDATED",
      entityType: "Company",
      entityId: current.id,
      metadata: {
        previousName: current.name,
        nextName: parsed.data.name,
        ownerId: parsed.data.ownerId,
      },
    },
  });

  revalidateAdminCatalogPages();
  redirect("/admin/companies?updated=1");
}

export async function deleteCompany(formData: FormData) {
  const parsed = companyIdSchema.safeParse({
    companyId: formData.get("companyId"),
  });

  if (!parsed.success) {
    redirect("/admin/companies?error=invalid_company");
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          jobs: { where: { status: JobStatus.OPEN } },
        },
      },
    },
  });

  if (!company) {
    redirect("/admin/companies?error=not_found");
  }

  if (company._count.jobs > 0) {
    redirect("/admin/companies?error=active_jobs");
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "COMPANY_DELETED",
        entityType: "Company",
        entityId: company.id,
        metadata: { name: company.name },
      },
    });

    await tx.company.delete({ where: { id: company.id } });
  });

  revalidateAdminCatalogPages();
  redirect("/admin/companies?deleted=1");
}

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ("ADMIN" satisfies Role)) {
    redirect("/unauthorized");
  }

  return user;
}

function parseCompanyForm(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    websiteUrl: formData.get("websiteUrl"),
    logoUrl: formData.get("logoUrl"),
    industry: formData.get("industry"),
    location: formData.get("location"),
    size: formData.get("size"),
    ownerId: formData.get("ownerId"),
    isVerified: formData.get("isVerified") === "on",
  });
}

async function getUniqueCompanySlug(name: string, currentCompanyId?: string) {
  const prisma = getPrisma();
  const base = normalizeSlug(name);
  let slug = base;
  let attempt = 2;

  while (
    await prisma.company.findFirst({
      where: {
        slug,
        ...(currentCompanyId ? { NOT: { id: currentCompanyId } } : {}),
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
      .replace(/(^-|-$)+/g, "") || "company"
  );
}

function revalidateAdminCatalogPages() {
  revalidatePath("/admin/companies");
  revalidatePath("/admin/dashboard");
  revalidatePath("/jobs");
}
