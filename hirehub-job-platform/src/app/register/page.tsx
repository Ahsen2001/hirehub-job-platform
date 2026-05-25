import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
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
  title: "Register | HireHub",
  description: "Create a candidate or recruiter account on HireHub.",
};

export default function RegisterPage() {
  return (
    <MainLayout>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge variant="primary" className="w-fit">
            Join HireHub
          </Badge>
          <h1 className="mt-4 text-3xl font-bold text-dark sm:text-4xl">
            Build your hiring or career profile.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Candidates can discover and track applications. Recruiters can
            prepare company profiles for job posting and candidate review.
          </p>
          <div className="mt-6 grid gap-3">
            {["Candidate registration", "Recruiter registration"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-white p-4 text-sm font-semibold text-dark shadow-card"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Choose a role and complete the registration details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <p className="mt-5 text-center text-sm text-muted">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary-dark"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
