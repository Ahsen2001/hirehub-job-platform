import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/generated/prisma/client";

export const SESSION_COOKIE_NAME = "hirehub_session";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export const roleRedirects: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  RECRUITER: "/recruiter/dashboard",
  CANDIDATE: "/candidate/dashboard",
};

export function getRoleRedirect(role: Role) {
  return roleRedirects[role];
}

export function getSessionSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (secret) {
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required.");
  }

  return new TextEncoder().encode("hirehub-development-session-secret");
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
      name: payload.name,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
