import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import {
  UserManagementList,
  type AdminManagedUser,
} from "@/components/admin/user-management";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Recruiters | HireHub Admin",
};

type AdminRecruitersPageProps = {
  searchParams: Promise<{
    q?: string;
    updated?: string;
    roleChanged?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminRecruitersPage({
  searchParams,
}: AdminRecruitersPageProps) {
  const [params, admin] = await Promise.all([searchParams, getCurrentUser()]);

  if (!admin) {
    redirect("/login");
  }

  if (admin.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const query = normalize(params.q);
  const prisma = getPrisma();
  const where = {
    role: Role.RECRUITER,
    OR: query
      ? [
          { email: { contains: query, mode: "insensitive" as const } },
          {
            profile: {
              is: {
                firstName: { contains: query, mode: "insensitive" as const },
              },
            },
          },
          {
            profile: {
              is: {
                lastName: { contains: query, mode: "insensitive" as const },
              },
            },
          },
          {
            recruiterCompany: {
              is: {
                name: { contains: query, mode: "insensitive" as const },
              },
            },
          },
        ]
      : undefined,
  };

  const [recruiters, totalRecruiters, activeRecruiters, assignedRecruiters] =
    await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          profile: { select: { firstName: true, lastName: true } },
          recruiterCompany: {
            select: {
              name: true,
              isVerified: true,
              _count: { select: { jobs: true } },
            },
          },
          _count: {
            select: {
              ownedCompanies: true,
              postedJobs: true,
              applications: true,
              interviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({
        where: { ...where, recruiterCompanyId: { not: null } },
      }),
    ]);

  return (
    <>
      <DashboardPageHeader
        title="Recruiters"
        description="Review recruiter accounts, company assignments, and posted job counts."
      />

      <StatusMessage params={params} />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardMetric
          label="Matching recruiters"
          value={totalRecruiters.toString()}
        />
        <DashboardMetric
          label="Active recruiters"
          value={activeRecruiters.toString()}
        />
        <DashboardMetric
          label="Assigned to company"
          value={assignedRecruiters.toString()}
        />
      </section>

      <FilterForm query={query} />

      <section className="mt-6">
        {recruiters.length > 0 ? (
          <UserManagementList
            users={recruiters.map(toManagedUser)}
            currentAdminId={admin.id}
            redirectTo={getRedirectPath(query)}
            showRecruiterDetails
          />
        ) : (
          <EmptyState
            title="No recruiters found"
            description="Try a different recruiter name, email, or company search."
          />
        )}
      </section>
    </>
  );
}

function FilterForm({ query }: { query: string }) {
  return (
    <form
      action="/admin/recruiters"
      className="mt-6 grid gap-3 rounded-card border border-border bg-white p-5 shadow-card lg:grid-cols-[1fr_auto]"
    >
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Search recruiters
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, email, or company"
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
  params: Awaited<AdminRecruitersPageProps["searchParams"]>;
}) {
  const success =
    (params.updated && "Recruiter access status updated.") ||
    (params.roleChanged && "Recruiter role changed.") ||
    (params.deleted && "Recruiter deleted.");

  const error =
    params.error === "self_update"
      ? "You cannot change your own access status or role."
      : params.error === "self_delete"
        ? "You cannot delete your own admin account."
        : params.error === "not_found"
          ? "Recruiter not found."
          : params.error === "invalid_role"
            ? "Invalid role selected."
            : params.error === "invalid_user"
              ? "Invalid recruiter selected."
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

function toManagedUser(user: {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  profile: { firstName: string; lastName: string } | null;
  recruiterCompany: {
    name: string;
    isVerified: boolean;
    _count: { jobs: number };
  } | null;
  _count: {
    ownedCompanies: number;
    postedJobs: number;
    applications: number;
    interviews: number;
  };
}): AdminManagedUser {
  const companyLabel = user.recruiterCompany
    ? `${user.recruiterCompany.name} (${user.recruiterCompany._count.jobs} jobs${
        user.recruiterCompany.isVerified ? ", verified" : ""
      })`
    : null;

  return {
    id: user.id,
    name: user.profile
      ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ")
      : user.email,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: formatDate(user.createdAt),
    lastLoginAt: user.lastLoginAt ? formatDate(user.lastLoginAt) : null,
    companyName: companyLabel,
    ownedCompaniesCount: user._count.ownedCompanies,
    postedJobsCount: user._count.postedJobs,
    applicationsCount: user._count.applications,
    interviewsCount: user._count.interviews,
  };
}

function getRedirectPath(query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  const suffix = params.toString();
  return suffix ? `/admin/recruiters?${suffix}` : "/admin/recruiters";
}

function normalize(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
