"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type Role } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  categoryIdSchema,
  categorySchema,
  getFirstCatalogIssue,
} from "@/lib/admin/catalog-validation";

export type CategoryActionState = {
  error?: string;
};

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: getFirstCatalogIssue(parsed.error) };
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const category = await prisma.jobCategory.create({
    data: {
      ...parsed.data,
      slug: await getUniqueCategorySlug(parsed.data.name),
    },
    select: { id: true, name: true },
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "CATEGORY_CREATED",
      entityType: "JobCategory",
      entityId: category.id,
      metadata: { name: category.name },
    },
  });

  revalidateAdminCategoryPages();
  redirect("/admin/categories?created=1");
}

export async function updateCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const idParsed = categoryIdSchema.safeParse({
    categoryId: formData.get("categoryId"),
  });
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!idParsed.success) {
    return { error: getFirstCatalogIssue(idParsed.error) };
  }

  if (!parsed.success) {
    return { error: getFirstCatalogIssue(parsed.error) };
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const current = await prisma.jobCategory.findUnique({
    where: { id: idParsed.data.categoryId },
    select: { id: true, name: true, slug: true },
  });

  if (!current) {
    return { error: "Category not found." };
  }

  const nextSlug =
    normalizeSlug(current.name) === normalizeSlug(parsed.data.name)
      ? current.slug
      : await getUniqueCategorySlug(parsed.data.name, current.id);

  await prisma.jobCategory.update({
    where: { id: current.id },
    data: {
      ...parsed.data,
      slug: nextSlug,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "CATEGORY_UPDATED",
      entityType: "JobCategory",
      entityId: current.id,
      metadata: {
        previousName: current.name,
        nextName: parsed.data.name,
      },
    },
  });

  revalidateAdminCategoryPages();
  redirect("/admin/categories?updated=1");
}

export async function deleteCategory(formData: FormData) {
  const parsed = categoryIdSchema.safeParse({
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    redirect("/admin/categories?error=invalid_category");
  }

  const admin = await requireAdmin();
  const prisma = getPrisma();
  const category = await prisma.jobCategory.findUnique({
    where: { id: parsed.data.categoryId },
    select: {
      id: true,
      name: true,
      _count: { select: { jobs: true } },
    },
  });

  if (!category) {
    redirect("/admin/categories?error=not_found");
  }

  if (category._count.jobs > 0) {
    redirect("/admin/categories?error=jobs_exist");
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "CATEGORY_DELETED",
        entityType: "JobCategory",
        entityId: category.id,
        metadata: { name: category.name },
      },
    });

    await tx.jobCategory.delete({ where: { id: category.id } });
  });

  revalidateAdminCategoryPages();
  redirect("/admin/categories?deleted=1");
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

async function getUniqueCategorySlug(name: string, currentCategoryId?: string) {
  const prisma = getPrisma();
  const base = normalizeSlug(name);
  let slug = base;
  let attempt = 2;

  while (
    await prisma.jobCategory.findFirst({
      where: {
        slug,
        ...(currentCategoryId ? { NOT: { id: currentCategoryId } } : {}),
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
      .replace(/(^-|-$)+/g, "") || "category"
  );
}

function revalidateAdminCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/dashboard");
  revalidatePath("/jobs");
}
