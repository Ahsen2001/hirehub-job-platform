import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name must be 80 characters or less."),
    email: z.email("Enter a valid email address.").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string(),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
    desiredRole: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "RECRUITER" || Boolean(data.companyName), {
    message: "Company name is required for recruiter accounts.",
    path: ["companyName"],
  });

export function getFirstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
