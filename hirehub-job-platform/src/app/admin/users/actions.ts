"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type Role } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";
import {
  adminUserIdSchema,
  adminUserRoleSchema,
} from "@/lib/admin/user-validation";

export async function toggleUserStatus(formData: FormData) {
  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
    redirectTo: formData.get("redirectTo") ?? "/admin/users",
  });

  if (!parsed.success) {
    redirect("/admin/users?error=invalid_user");
  }

  const admin = await requireAdmin();

  if (parsed.data.userId === admin.id) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=self_update`);
  }

  const prisma = getPrisma();
  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, isActive: true, role: true },
  });

  if (!target) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=not_found`);
  }

  const nextIsActive = !target.isActive;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: { isActive: nextIsActive },
    });

    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: nextIsActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        entityType: "User",
        entityId: target.id,
        metadata: {
          email: target.email,
          role: target.role,
          previousIsActive: target.isActive,
          nextIsActive,
        },
      },
    });
  });

  revalidateAdminUserPages();
  redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?updated=1`);
}

export async function changeUserRole(formData: FormData) {
  const parsed = adminUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    redirectTo: formData.get("redirectTo") ?? "/admin/users",
  });

  if (!parsed.success) {
    redirect("/admin/users?error=invalid_role");
  }

  const admin = await requireAdmin();

  if (parsed.data.userId === admin.id) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=self_update`);
  }

  const prisma = getPrisma();
  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=not_found`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: { role: parsed.data.role },
    });

    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "USER_ROLE_CHANGED",
        entityType: "User",
        entityId: target.id,
        metadata: {
          email: target.email,
          previousRole: target.role,
          nextRole: parsed.data.role,
        },
      },
    });
  });

  revalidateAdminUserPages();
  redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?roleChanged=1`);
}

export async function deleteUser(formData: FormData) {
  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
    redirectTo: formData.get("redirectTo") ?? "/admin/users",
  });

  if (!parsed.success) {
    redirect("/admin/users?error=invalid_user");
  }

  const admin = await requireAdmin();

  if (parsed.data.userId === admin.id) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=self_delete`);
  }

  const prisma = getPrisma();
  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?error=not_found`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "USER_DELETED",
        entityType: "User",
        entityId: target.id,
        metadata: {
          email: target.email,
          role: target.role,
        },
      },
    });

    await tx.user.delete({ where: { id: target.id } });
  });

  revalidateAdminUserPages();
  redirect(`${sanitizeRedirect(parsed.data.redirectTo)}?deleted=1`);
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

function sanitizeRedirect(value: string) {
  return value.startsWith("/admin/") ? value : "/admin/users";
}

function revalidateAdminUserPages() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/recruiters");
  revalidatePath("/admin/dashboard");
}
