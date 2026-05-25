import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login | HireHub",
  description: "Sign in to your HireHub account.",
};

export default function LoginPage() {
  return (
    <MainLayout>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Badge variant="primary" className="w-fit">
              Welcome back
            </Badge>
            <CardTitle className="text-2xl">Sign in to HireHub</CardTitle>
            <CardDescription>
              Access your candidate or recruiter workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-5 text-center text-sm text-muted">
              New to HireHub?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary-dark"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
