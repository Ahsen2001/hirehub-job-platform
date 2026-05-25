"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { RecruiterJobActionState } from "@/app/recruiter/jobs/actions";

const initialState: RecruiterJobActionState = {};
const jobTypes = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "REMOTE"] as const;
const jobStatuses = ["OPEN", "CLOSED"] as const;

type Option = {
  id: string;
  name: string;
};

type JobFormDefaults = {
  id?: string;
  title?: string;
  description?: string;
  requirements?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  location?: string;
  type?: string;
  categoryId?: string | null;
  companyId?: string;
  status?: string;
};

type JobFormProps = {
  action: (
    previousState: RecruiterJobActionState,
    formData: FormData,
  ) => Promise<RecruiterJobActionState>;
  categories: Option[];
  companies: Option[];
  defaults?: JobFormDefaults;
  submitLabel: string;
};

export function RecruiterJobForm({
  action,
  categories,
  companies,
  defaults,
  submitLabel,
}: JobFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {defaults?.id ? (
        <input type="hidden" name="jobId" value={defaults.id} />
      ) : null}
      <ActionMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Title"
          name="title"
          defaultValue={defaults?.title ?? ""}
          placeholder="Senior Product Designer"
          className="md:col-span-2"
        />
        <SelectField
          label="Company"
          name="companyId"
          defaultValue={defaults?.companyId ?? companies[0]?.id ?? ""}
          options={companies}
        />
        <SelectField
          label="Category"
          name="categoryId"
          defaultValue={defaults?.categoryId ?? categories[0]?.id ?? ""}
          options={categories}
        />
        <SelectField
          label="Job type"
          name="type"
          defaultValue={defaults?.type ?? "FULL_TIME"}
          options={jobTypes.map((type) => ({
            id: type,
            name: formatConstant(type),
          }))}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={defaults?.status ?? "OPEN"}
          options={jobStatuses.map((status) => ({
            id: status,
            name: formatConstant(status),
          }))}
        />
        <Field
          label="Location"
          name="location"
          defaultValue={defaults?.location ?? ""}
          placeholder="Colombo, Sri Lanka"
        />
        <Field
          label="Currency"
          name="salaryCurrency"
          defaultValue={defaults?.salaryCurrency ?? "USD"}
          placeholder="USD"
        />
        <Field
          label="Minimum salary"
          name="salaryMin"
          type="number"
          defaultValue={defaults?.salaryMin?.toString() ?? ""}
          placeholder="60000"
        />
        <Field
          label="Maximum salary"
          name="salaryMax"
          type="number"
          defaultValue={defaults?.salaryMax?.toString() ?? ""}
          placeholder="90000"
        />
      </div>

      <TextAreaField
        label="Description"
        name="description"
        defaultValue={defaults?.description ?? ""}
        rows={7}
        placeholder="Describe the role, team, and impact."
      />
      <TextAreaField
        label="Requirements"
        name="requirements"
        defaultValue={defaults?.requirements ?? ""}
        rows={7}
        placeholder={"One requirement per line\n3+ years of experience\nStrong communication skills"}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/recruiter/jobs"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
        >
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-dark ${className ?? ""}`}>
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Option[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium leading-6 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ActionMessage({ state }: { state: RecruiterJobActionState }) {
  if (!state.error) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-danger">
      {state.error}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function formatConstant(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
