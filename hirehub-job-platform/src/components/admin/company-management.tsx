"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createCompany,
  deleteCompany,
  updateCompany,
  type CompanyActionState,
} from "@/app/admin/companies/actions";
import { Badge } from "@/components/ui/badge";

const initialState: CompanyActionState = {};

type OwnerOption = {
  id: string;
  name: string;
  email: string;
};

export type ManagedCompany = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  location: string;
  size: string;
  ownerId: string;
  ownerName: string;
  isVerified: boolean;
  totalJobs: number;
  activeJobs: number;
  recruitersCount: number;
};

export function CompanyManagement({
  companies,
  ownerOptions,
}: {
  companies: ManagedCompany[];
  ownerOptions: OwnerOption[];
}) {
  return (
    <div className="space-y-5">
      <CompanyForm ownerOptions={ownerOptions} mode="create" />
      <div className="space-y-4">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            ownerOptions={ownerOptions}
          />
        ))}
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  ownerOptions,
}: {
  company: ManagedCompany;
  ownerOptions: OwnerOption[];
}) {
  return (
    <article className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-dark">{company.name}</h2>
            <Badge variant={company.isVerified ? "success" : "slate"}>
              {company.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {company.description || "No description provided."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span>Owner: {company.ownerName}</span>
            <span>{company.recruitersCount} recruiters</span>
            <span>{company.totalJobs} jobs</span>
            <span>{company.activeJobs} active jobs</span>
          </div>
        </div>
        <form
          action={deleteCompany}
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${company.name}?`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="companyId" value={company.id} />
          <button
            type="submit"
            disabled={company.activeJobs > 0}
            title={
              company.activeJobs > 0
                ? "Companies with active jobs cannot be deleted."
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
          Edit company
        </summary>
        <div className="mt-4">
          <CompanyForm
            ownerOptions={ownerOptions}
            mode="edit"
            company={company}
          />
        </div>
      </details>
    </article>
  );
}

function CompanyForm({
  ownerOptions,
  mode,
  company,
}: {
  ownerOptions: OwnerOption[];
  mode: "create" | "edit";
  company?: ManagedCompany;
}) {
  const [state, formAction] = useActionState(
    mode === "create" ? createCompany : updateCompany,
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
          <h2 className="text-lg font-bold text-dark">Add company</h2>
          <p className="mt-1 text-sm text-muted">
            Create a company profile and optionally assign a recruiter owner.
          </p>
        </div>
      ) : null}
      <ActionMessage state={state} />
      {company ? <input type="hidden" name="companyId" value={company.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" defaultValue={company?.name ?? ""} />
        <Field
          label="Industry"
          name="industry"
          defaultValue={company?.industry ?? ""}
        />
        <Field
          label="Location"
          name="location"
          defaultValue={company?.location ?? ""}
        />
        <Field label="Size" name="size" defaultValue={company?.size ?? ""} />
        <Field
          label="Website URL"
          name="websiteUrl"
          defaultValue={company?.websiteUrl ?? ""}
        />
        <Field
          label="Logo URL"
          name="logoUrl"
          defaultValue={company?.logoUrl ?? ""}
        />
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Recruiter owner
          <select
            name="ownerId"
            defaultValue={company?.ownerId ?? ""}
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
          >
            <option value="">No owner</option>
            {ownerOptions.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end rounded-lg border border-border bg-white px-3 py-3 text-sm font-semibold text-dark">
          <input
            type="checkbox"
            name="isVerified"
            defaultChecked={company?.isVerified ?? false}
            className="size-4 rounded border-border text-primary"
          />
          Verified company
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-semibold text-dark">
        Description
        <textarea
          name="description"
          defaultValue={company?.description ?? ""}
          rows={4}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <SubmitButton
        label={mode === "create" ? "Add company" : "Save company"}
        pendingLabel="Saving..."
      />
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ActionMessage({ state }: { state: CompanyActionState }) {
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
