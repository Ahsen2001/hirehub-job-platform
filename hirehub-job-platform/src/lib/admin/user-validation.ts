import { Role } from "@/generated/prisma/client";
import { z } from "zod";

export const adminUserIdSchema = z.object({
  userId: z.uuid("Invalid user id."),
  redirectTo: z.string().trim().min(1).default("/admin/users"),
});

export const adminUserRoleSchema = adminUserIdSchema.extend({
  role: z.enum(Role, "Choose a valid role."),
});

export function getFirstAdminUserIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the request and try again.";
}
