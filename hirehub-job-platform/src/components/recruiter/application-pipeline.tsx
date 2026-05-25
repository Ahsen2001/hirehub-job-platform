"use client";

import Link from "next/link";
import { useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateApplicationStatus,
  type ApplicationPipelineActionState,
} from "@/app/recruiter/applications/actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const initialState: ApplicationPipelineActionState = {};
const statuses = ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"] as const;
const interviewModes = ["PHONE", "VIDEO", "ONSITE"] as const;

type ApplicationStatusValue = (typeof statuses)[number];

export type PipelineApplication = {
  id: string;
  status: ApplicationStatusValue;
  candidateName: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  resumeUrl: string | null;
  skills: string[];
  latestInterview?: {
    title: string;
    scheduledAt: string;
  } | null;
};

type ApplicationPipelineProps = {
  applications: PipelineApplication[];
  redirectTo: string;
  emptyTitle: string;
  emptyDescription: string;
};

const statusLabels: Record<ApplicationStatusValue, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  REJECTED: "Rejected",
};

const statusVariants: Record<
  ApplicationStatusValue,
  "primary" | "success" | "warning" | "danger" | "slate"
> = {
  APPLIED: "primary",
  SHORTLISTED: "warning",
  INTERVIEW: "primary",
  OFFERED: "success",
  REJECTED: "danger",
};

export function ApplicationPipeline({
  applications,
  redirectTo,
  emptyTitle,
  emptyDescription,
}: ApplicationPipelineProps) {
  const groupedApplications = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        applications: applications.filter(
          (application) => application.status === status,
        ),
      })),
    [applications],
  );

  if (applications.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      {groupedApplications.map((column) => (
        <div
          key={column.status}
          className="rounded-card border border-border bg-white p-4 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge variant={statusVariants[column.status]}>
              {statusLabels[column.status]}
            </Badge>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-dark">
              {column.applications.length}
            </span>
          </div>

          {column.applications.length > 0 ? (
            <div className="space-y-3">
              {column.applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  redirectTo={redirectTo}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm font-medium text-muted">
              No applications
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function ApplicationCard({
  application,
  redirectTo,
}: {
  application: PipelineApplication;
  redirectTo: string;
}) {
  const [state, formAction] = useActionState(updateApplicationStatus, initialState);
  const [nextStatus, setNextStatus] = useState<ApplicationStatusValue>(
    application.status,
  );

  return (
    <article className="rounded-xl border border-border bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-white">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-dark">{application.candidateName}</h3>
        <Link
          href={`/recruiter/jobs/${application.jobId}/applications`}
          className="block text-xs font-semibold text-primary hover:text-primary-dark"
        >
          {application.jobTitle}
        </Link>
        <p className="text-xs font-medium text-muted">
          Applied {application.appliedDate}
        </p>
      </div>

      <div className="mt-3">
        {application.resumeUrl ? (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-bold text-primary hover:text-primary-dark"
          >
            View CV
          </a>
        ) : (
          <span className="text-xs font-semibold text-slate-500">
            No CV attached
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {application.skills.length > 0 ? (
          application.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-primary"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-xs font-medium text-muted">No skills listed</span>
        )}
        {application.skills.length > 4 ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            +{application.skills.length - 4}
          </span>
        ) : null}
      </div>

      {application.latestInterview ? (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-dark">
          <p className="font-bold">{application.latestInterview.title}</p>
          <p className="mt-1 text-muted">{application.latestInterview.scheduledAt}</p>
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          if (
            nextStatus === "REJECTED" &&
            !window.confirm("Reject this candidate application?")
          ) {
            event.preventDefault();
          }

          if (
            nextStatus === "OFFERED" &&
            !window.confirm("Mark this candidate as offered?")
          ) {
            event.preventDefault();
          }
        }}
      >
        {state.error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-danger">
            {state.error}
          </div>
        ) : null}

        <input type="hidden" name="applicationId" value={application.id} />
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <label className="grid gap-1.5 text-xs font-bold text-dark">
          Update status
          <select
            name="status"
            value={nextStatus}
            onChange={(event) =>
              setNextStatus(event.target.value as ApplicationStatusValue)
            }
            className="h-10 rounded-lg border border-border bg-white px-2 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        {nextStatus === "INTERVIEW" ? <InterviewFields /> : null}

        {nextStatus === "REJECTED" ? (
          <label className="grid gap-1.5 text-xs font-bold text-dark">
            Rejection note
            <textarea
              name="note"
              rows={3}
              placeholder="Optional internal note"
              className="rounded-lg border border-border px-2 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
        ) : null}

        <SubmitButton />
      </form>
    </article>
  );
}

function InterviewFields() {
  return (
    <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <label className="grid gap-1.5 text-xs font-bold text-dark">
        Interview title
        <input
          name="interviewTitle"
          placeholder="Technical interview"
          className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-bold text-dark">
        Date and time
        <input
          type="datetime-local"
          name="interviewScheduledAt"
          className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1.5 text-xs font-bold text-dark">
          Duration
          <input
            type="number"
            name="interviewDurationMins"
            defaultValue="30"
            min="15"
            className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-dark">
          Mode
          <select
            name="interviewMode"
            defaultValue="VIDEO"
            className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
          >
            {interviewModes.map((mode) => (
              <option key={mode} value={mode}>
                {formatConstant(mode)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1.5 text-xs font-bold text-dark">
        Meeting URL
        <input
          name="interviewMeetingUrl"
          placeholder="https://meet.example.com/session"
          className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-bold text-dark">
        Location
        <input
          name="interviewLocation"
          placeholder="Remote or office address"
          className="h-10 rounded-lg border border-blue-100 bg-white px-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Updating..." : "Update"}
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
