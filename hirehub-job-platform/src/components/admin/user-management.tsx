"use client";

import { deleteUser, changeUserRole, toggleUserStatus } from "@/app/admin/users/actions";
import { Badge } from "@/components/ui/badge";

const roles = ["ADMIN", "RECRUITER", "CANDIDATE"] as const;

export type AdminManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  companyName?: string | null;
  ownedCompaniesCount: number;
  postedJobsCount: number;
  applicationsCount: number;
  interviewsCount: number;
};

export function UserManagementList({
  users,
  currentAdminId,
  redirectTo,
  showRecruiterDetails = false,
}: {
  users: AdminManagedUser[];
  currentAdminId: string;
  redirectTo: string;
  showRecruiterDetails?: boolean;
}) {
  return (
    <div className="space-y-4">
      {users.map((user) => {
        const isSelf = user.id === currentAdminId;

        return (
          <article
            key={user.id}
            className="rounded-card border border-border bg-white p-5 shadow-card"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-dark">{user.name}</h2>
                  <Badge variant={getRoleVariant(user.role)}>
                    {formatConstant(user.role)}
                  </Badge>
                  <Badge variant={user.isActive ? "success" : "slate"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {isSelf ? <Badge variant="outline">You</Badge> : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-muted">
                  {user.email}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Joined {user.createdAt}
                  {user.lastLoginAt ? ` / Last login ${user.lastLoginAt}` : ""}
                </p>

                <details className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-dark">
                    View details
                  </summary>
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                    <Detail label="Owned companies" value={user.ownedCompaniesCount} />
                    <Detail label="Posted jobs" value={user.postedJobsCount} />
                    <Detail label="Applications" value={user.applicationsCount} />
                    <Detail label="Interviews" value={user.interviewsCount} />
                    {showRecruiterDetails ? (
                      <Detail
                        label="Recruiter company"
                        value={user.companyName ?? "Not assigned"}
                      />
                    ) : null}
                  </div>
                </details>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
                <form
                  action={changeUserRole}
                  className="space-y-2"
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Change ${user.name}'s role? This may affect dashboard access.`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <label className="grid gap-1.5 text-xs font-bold text-dark">
                    Role
                    <select
                      name="role"
                      defaultValue={user.role}
                      disabled={isSelf}
                      className="h-10 rounded-lg border border-border bg-white px-2 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {formatConstant(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={isSelf}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Change
                  </button>
                </form>

                <form
                  action={toggleUserStatus}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `${user.isActive ? "Deactivate" : "Activate"} ${user.name}?`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    disabled={isSelf}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>

                <form
                  action={deleteUser}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Delete ${user.name}? This action cannot be undone.`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    disabled={isSelf}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-dark">{value}</p>
    </div>
  );
}

function getRoleVariant(role: string) {
  if (role === "ADMIN") {
    return "primary";
  }

  if (role === "RECRUITER") {
    return "warning";
  }

  return "success";
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
