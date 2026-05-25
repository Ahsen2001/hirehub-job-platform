"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/data/jobs";

type JobsFilterProps = {
  jobs: Job[];
  locations: string[];
  categories: string[];
  types: string[];
};

export function JobsFilter({
  jobs,
  locations,
  categories,
  types,
}: JobsFilterProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        [job.title, job.company, job.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesLocation = location === "All" || job.location === location;
      const matchesCategory = category === "All" || job.category === category;
      const matchesType = type === "All" || job.type === type;

      return matchesQuery && matchesLocation && matchesCategory && matchesType;
    });
  }, [category, jobs, location, query, type]);

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="grid gap-2 text-sm font-semibold text-dark">
            Search jobs
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Job title, company, or keyword"
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <FilterSelect
            label="Location"
            value={location}
            values={locations}
            onChange={setLocation}
          />
          <FilterSelect
            label="Category"
            value={category}
            values={categories}
            onChange={setCategory}
          />
          <FilterSelect
            label="Job type"
            value={type}
            values={types}
            onChange={setType}
          />
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs found"
          description="Try changing your search terms or filters to discover more roles."
        />
      )}
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, values, onChange }: FilterSelectProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
      >
        <option value="All">All</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
