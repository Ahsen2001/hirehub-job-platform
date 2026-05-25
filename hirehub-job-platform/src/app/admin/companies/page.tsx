import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobStatus, Role } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import {
  CompanyManagement,
  type ManagedCompany,
} from "@/components/admin/company-management";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Companies | HireHub Admin",
};

type AdminCompaniesPageProps = {
  searchParams: Promise<{
    q?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminCompaniesPage({
  searchParams,
}: AdminCompaniesPageProps) {
  const [params, admin] = await Promise.all([searchParams, getCurrentUser()]);

  if (!admin) {
    redirect("/login");
  }

  if (admin.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const query = normalize(params.q);
  const prisma = getPrisma();
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { industry: { contains: query, mode: "insensitive" as const } },
          { location: { contains: query, mode: "insensitive" as const } },
          {
            owner: {
              is: { email: { contains: query, mode: "insensitive" as const } },
            },
          },
        ],
      }
    : undefined;

  const [companies, totalCompanies, verifiedCompanies, ownerOptions] =
    await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          recruiters: { select: { id: true } },
          jobs: { select: { status: true } },
          _count: { select: { jobs: true } },
        },
      }),
      prisma.company.count({ where }),
      prisma.company.count({ where: { ...where, isVerified: true } }),
      prisma.user.findMany({
        where: { role: Role.RECRUITER },
        orderBy: { email: "asc" },
        select: {
          id: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  const activeJobCount = companies.reduce(
    (total, company) =>
      total + company.jobs.filter((job) => job.status === JobStatus.OPEN).length,
    0,
  );

  return (
    <>
      <DashboardPageHeader
        title="Companies"
        description="Create, edit, search, and manage company profiles used by HireHub jobs."
      />

      <StatusMessage params={params} />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardMetric
          label="Matching companies"
          value={totalCompanies.toString()}
        />
        <DashboardMetric
          label="Verified companies"
          value={verifiedCompanies.toString()}
        />
        <DashboardMetric label="Active jobs" value={activeJobCount.toString()} />
      </section>

      <SearchForm query={query} />

      <section className="mt-6">
        <CompanyManagement
          companies={companies.map(toManagedCompany)}
          ownerOptions={ownerOptions.map((owner) => ({
            id: owner.id,
            email: owner.email,
            name: getUserName(owner),
          }))}
        />
        {companies.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No companies found"
              description="Try a different company, industry, location, or owner search."
            />
          </div>
        ) : null}
      </section>
    </>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form
      action="/admin/companies"
      className="mt-6 grid gap-3 rounded-card border border-border bg-white p-5 shadow-card lg:grid-cols-[1fr_auto]"
    >
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Search companies
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by company, industry, location, or owner email"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <button
        type="submit"
        className="self-end rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
      >
        Search
      </button>
    </form>
  );
}

function StatusMessage({
  params,
}: {
  params: Awaited<AdminCompaniesPageProps["searchParams"]>;
}) {
  const success =
    (params.created && "Company created successfully.") ||
    (params.updated && "Company updated successfully.") ||
    (params.deleted && "Company deleted.");

  const error =
    params.error === "active_jobs"
      ? "Companies with active jobs cannot be deleted."
      : params.error === "not_found"
        ? "Company not found."
        : params.error === "invalid_company"
          ? "Invalid company selected."
          : undefined;

  if (!success && !error) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-danger"
          : "mb-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-success"
      }
    >
      {error ?? success}
    </div>
  );
}

function toManagedCompany(company: {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  size: string | null;
  ownerId: string | null;
  owner: {
    email: string;
    profile: { firstName: string; lastName: string } | null;
  } | null;
  isVerified: boolean;
  recruiters: { id: string }[];
  jobs: { status: JobStatus }[];
  _count: { jobs: number };
}): ManagedCompany {
  return {
    id: company.id,
    name: company.name,
    description: company.description ?? "",
    websiteUrl: company.websiteUrl ?? "",
    logoUrl: company.logoUrl ?? "",
    industry: company.industry ?? "",
    location: company.location ?? "",
    size: company.size ?? "",
    ownerId: company.ownerId ?? "",
    ownerName: company.owner ? getUserName(company.owner) : "No owner",
    isVerified: company.isVerified,
    totalJobs: company._count.jobs,
    activeJobs: company.jobs.filter((job) => job.status === JobStatus.OPEN).length,
    recruitersCount: company.recruiters.length,
  };
}

function getUserName(user: {
  email: string;
  profile: { firstName: string; lastName: string } | null;
}) {
  return user.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ")
    : user.email;
}

function normalize(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
