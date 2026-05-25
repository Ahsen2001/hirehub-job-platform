import Link from "next/link";
import { JobType } from "@/generated/prisma/client";

type JobsFilterProps = {
  query?: string;
  location?: string;
  category?: string;
  type?: string;
  locations: string[];
  categories: Array<{ id: string; name: string }>;
};

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

export function JobsFilter({
  query = "",
  location = "",
  category = "",
  type = "",
  locations,
  categories,
}: JobsFilterProps) {
  return (
    <form className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr_1fr_auto]">
        <label className="grid gap-2 text-sm font-semibold text-dark">
          Search jobs
          <input
            name="q"
            defaultValue={query}
            placeholder="Job title or company name"
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <FilterSelect label="Location" name="location" value={location}>
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Category" name="category" value={category}>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Job type" name="type" value={type}>
          {Object.values(JobType).map((item) => (
            <option key={item} value={item}>
              {jobTypeLabels[item]}
            </option>
          ))}
        </FilterSelect>

        <div className="flex items-end gap-2">
          <button className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
            Search
          </button>
          <Link
            href="/jobs"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-primary hover:text-primary"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
      >
        <option value="">All</option>
        {children}
      </select>
    </label>
  );
}
