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
  title: "Users | HireHub Admin",
};

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    updated?: string;
    roleChanged?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const [params, admin] = await Promise.all([searchParams, getCurrentUser()]);

  if (!admin) {
    redirect("/login");
  }

  if (admin.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const query = normalize(params.q);
  const selectedRole = isRole(params.role) ? params.role : "";
  const prisma = getPrisma();
  const where = {
    role: selectedRole || undefined,
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
        ]
      : undefined,
  };

  const [users, totalUsers, activeUsers, inactiveUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profile: { select: { firstName: true, lastName: true } },
        recruiterCompany: { select: { name: true } },
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
    prisma.user.count({ where: { ...where, isActive: false } }),
  ]);

  return (
    <>
      <DashboardPageHeader
        title="Users"
        description="Search, inspect, activate, deactivate, delete, and adjust access roles for HireHub users."
      />

      <StatusMessage params={params} />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardMetric label="Matching users" value={totalUsers.toString()} />
        <DashboardMetric label="Active users" value={activeUsers.toString()} />
        <DashboardMetric label="Inactive users" value={inactiveUsers.toString()} />
      </section>

      <FilterForm query={query} selectedRole={selectedRole} />

      <section className="mt-6">
        {users.length > 0 ? (
          <UserManagementList
            users={users.map(toManagedUser)}
            currentAdminId={admin.id}
            redirectTo={getRedirectPath(query, selectedRole)}
          />
        ) : (
          <EmptyState
            title="No users found"
            description="Try a different search term or role filter."
          />
        )}
      </section>
    </>
  );
}

function FilterForm({
  query,
  selectedRole,
}: {
  query: string;
  selectedRole: string;
}) {
  return (
    <form
      action="/admin/users"
      className="mt-6 grid gap-3 rounded-card border border-border bg-white p-5 shadow-card lg:grid-cols-[1fr_220px_auto]"
    >
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Search
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name or email"
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Role
        <select
          name="role"
          defaultValue={selectedRole}
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
        >
          <option value="">All roles</option>
          {Object.values(Role).map((role) => (
            <option key={role} value={role}>
              {formatConstant(role)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="self-end rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
      >
        Apply
      </button>
    </form>
  );
}

function StatusMessage({
  params,
}: {
  params: Awaited<AdminUsersPageProps["searchParams"]>;
}) {
  const success =
    (params.updated && "User access status updated.") ||
    (params.roleChanged && "User role changed.") ||
    (params.deleted && "User deleted.");

  const error =
    params.error === "self_update"
      ? "You cannot change your own access status or role."
      : params.error === "self_delete"
        ? "You cannot delete your own admin account."
        : params.error === "not_found"
          ? "User not found."
          : params.error === "invalid_role"
            ? "Invalid role selected."
            : params.error === "invalid_user"
              ? "Invalid user selected."
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
  recruiterCompany: { name: string } | null;
  _count: {
    ownedCompanies: number;
    postedJobs: number;
    applications: number;
    interviews: number;
  };
}): AdminManagedUser {
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
    companyName: user.recruiterCompany?.name ?? null,
    ownedCompaniesCount: user._count.ownedCompanies,
    postedJobsCount: user._count.postedJobs,
    applicationsCount: user._count.applications,
    interviewsCount: user._count.interviews,
  };
}

function getRedirectPath(query: string, role: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (role) {
    params.set("role", role);
  }

  const suffix = params.toString();
  return suffix ? `/admin/users?${suffix}` : "/admin/users";
}

function normalize(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function isRole(value?: string): value is Role {
  return Boolean(value && Object.values(Role).includes(value as Role));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
