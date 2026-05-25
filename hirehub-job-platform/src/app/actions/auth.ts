"use server";

import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { getRoleRedirect } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  getFirstZodError,
  loginSchema,
  registerSchema,
} from "@/lib/auth/validation";
import { getPrisma } from "@/lib/prisma";

export type AuthActionState = {
  error?: string;
};

const databaseErrorMessage =
  "Database is not configured yet. Add DATABASE_URL to .env.local, run migrations, then seed the database.";

export async function loginUser(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) };
  }

  let user;

  try {
    const prisma = getPrisma();
    user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { profile: true },
    });

    if (!user?.passwordHash || !user.isActive) {
      return { error: "Invalid email or password." };
    }

    const isValidPassword = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return { error: "Invalid email or password." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.error("Login failed before session creation:", error);
    return { error: databaseErrorMessage };
  }

  const name = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  await setSessionCookie({
    id: user.id,
    email: user.email,
    role: user.role,
    name: name || user.email,
  });

  redirect(getRoleRedirect(user.role));
}

export async function registerUser(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    desiredRole: formData.get("desiredRole"),
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) };
  }

  let user;

  try {
    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return { error: "An account already exists for this email." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const [firstName, ...lastNameParts] = parsed.data.name.split(" ");
    const role = parsed.data.role as Role;

    user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role,
        profile: {
          create: {
            firstName,
            lastName: lastNameParts.join(" ") || "User",
            headline:
              role === "CANDIDATE"
                ? parsed.data.desiredRole || "HireHub candidate"
                : "HireHub recruiter",
          },
        },
      },
      include: { profile: true },
    });

    if (role === "RECRUITER" && parsed.data.companyName) {
      const slug = parsed.data.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const company = await prisma.company.create({
        data: {
          name: parsed.data.companyName,
          slug: `${slug}-${user.id.slice(0, 8)}`,
          ownerId: user.id,
        },
        select: { id: true },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { recruiterCompanyId: company.id },
      });
    }
  } catch (error) {
    console.error("Registration failed before session creation:", error);
    return { error: databaseErrorMessage };
  }

  const name = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  await setSessionCookie({
    id: user.id,
    email: user.email,
    role: user.role,
    name: name || user.email,
  });

  redirect(getRoleRedirect(user.role));
}

export async function logoutUser() {
  await clearSessionCookie();
  redirect("/login");
}
