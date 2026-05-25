import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import {
  DashboardMetric,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell";
import {
  CategoryManagement,
  type ManagedCategory,
} from "@/components/admin/category-management";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categories | HireHub Admin",
};

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    q?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
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
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [categories, totalCategories, usedCategories] = await Promise.all([
    prisma.jobCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { jobs: true } } },
    }),
    prisma.jobCategory.count({ where }),
    prisma.jobCategory.count({
      where: { ...where, jobs: { some: {} } },
    }),
  ]);

  const totalJobsInCategories = categories.reduce(
    (total, category) => total + category._count.jobs,
    0,
  );

  return (
    <>
      <DashboardPageHeader
        title="Categories"
        description="Create, edit, search, and safely remove job categories used across HireHub."
      />

      <StatusMessage params={params} />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardMetric
          label="Matching categories"
          value={totalCategories.toString()}
        />
        <DashboardMetric label="Used categories" value={usedCategories.toString()} />
        <DashboardMetric
          label="Jobs in results"
          value={totalJobsInCategories.toString()}
        />
      </section>

      <SearchForm query={query} />

      <section className="mt-6">
        <CategoryManagement categories={categories.map(toManagedCategory)} />
        {categories.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No categories found"
              description="Try a different category search."
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
      action="/admin/categories"
      className="mt-6 grid gap-3 rounded-card border border-border bg-white p-5 shadow-card lg:grid-cols-[1fr_auto]"
    >
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Search categories
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name or description"
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
  params: Awaited<AdminCategoriesPageProps["searchParams"]>;
}) {
  const success =
    (params.created && "Category created successfully.") ||
    (params.updated && "Category updated successfully.") ||
    (params.deleted && "Category deleted.");

  const error =
    params.error === "jobs_exist"
      ? "Categories used by jobs cannot be deleted."
      : params.error === "not_found"
        ? "Category not found."
        : params.error === "invalid_category"
          ? "Invalid category selected."
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

function toManagedCategory(category: {
  id: string;
  name: string;
  description: string | null;
  _count: { jobs: number };
}): ManagedCategory {
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? "",
    jobCount: category._count.jobs,
  };
}

function normalize(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
