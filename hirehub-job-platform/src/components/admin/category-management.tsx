"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryActionState,
} from "@/app/admin/categories/actions";
import { Badge } from "@/components/ui/badge";

const initialState: CategoryActionState = {};

export type ManagedCategory = {
  id: string;
  name: string;
  description: string;
  jobCount: number;
};

export function CategoryManagement({
  categories,
}: {
  categories: ManagedCategory[];
}) {
  return (
    <div className="space-y-5">
      <CategoryForm mode="create" />
      <div className="grid gap-4 xl:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: ManagedCategory }) {
  return (
    <article className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-dark">{category.name}</h2>
            <Badge variant={category.jobCount > 0 ? "primary" : "outline"}>
              {category.jobCount} jobs
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {category.description || "No description provided."}
          </p>
        </div>
        <form
          action={deleteCategory}
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${category.name}?`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <button
            type="submit"
            disabled={category.jobCount > 0}
            title={
              category.jobCount > 0
                ? "Categories used by jobs cannot be deleted."
                : undefined
            }
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-white px-4 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </form>
      </div>
      <details className="mt-5 rounded-xl border border-border bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-bold text-dark">
          Edit category
        </summary>
        <div className="mt-4">
          <CategoryForm mode="edit" category={category} />
        </div>
      </details>
    </article>
  );
}

function CategoryForm({
  mode,
  category,
}: {
  mode: "create" | "edit";
  category?: ManagedCategory;
}) {
  const [state, formAction] = useActionState(
    mode === "create" ? createCategory : updateCategory,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={
        mode === "create"
          ? "rounded-card border border-border bg-white p-5 shadow-card"
          : "space-y-4"
      }
    >
      {mode === "create" ? (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-dark">Add category</h2>
          <p className="mt-1 text-sm text-muted">
            Create a job category for public job filtering and recruiter job posts.
          </p>
        </div>
      ) : null}
      <ActionMessage state={state} />
      {category ? (
        <input type="hidden" name="categoryId" value={category.id} />
      ) : null}
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Name
        <input
          name="name"
          defaultValue={category?.name ?? ""}
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="mt-4 grid gap-2 text-sm font-semibold text-dark">
        Description
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={4}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <SubmitButton
        label={mode === "create" ? "Add category" : "Save category"}
        pendingLabel="Saving..."
      />
    </form>
  );
}

function ActionMessage({ state }: { state: CategoryActionState }) {
  if (!state.error) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-danger">
      {state.error}
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
