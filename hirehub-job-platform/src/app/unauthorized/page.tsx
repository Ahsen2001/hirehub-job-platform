import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Unauthorized | HireHub",
  description: "You do not have access to this HireHub area.",
};

export default function UnauthorizedPage() {
  return (
    <MainLayout>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-danger">
              !
            </div>
            <CardTitle className="text-2xl">Unauthorized access</CardTitle>
            <CardDescription>
              Your current role does not have permission to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Browse jobs
            </Link>
            <Button variant="outline">Contact support</Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
