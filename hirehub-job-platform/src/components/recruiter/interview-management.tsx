"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  completeInterview,
  createInterview,
  updateInterview,
  type InterviewActionState,
} from "@/app/recruiter/interviews/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const initialState: InterviewActionState = {};
const interviewModes = ["PHONE", "VIDEO", "ONSITE"] as const;

type ApplicationOption = {
  id: string;
  label: string;
};

export type RecruiterInterview = {
  id: string;
  title: string;
  candidateName: string;
  jobTitle: string;
  jobId: string;
  status: string;
  scheduledAtLabel: string;
  scheduledAtInput: string;
  durationMins: number;
  mode: string;
  meetingUrl: string | null;
  location: string | null;
  feedback: string | null;
};

export function InterviewManagement({
  applicationOptions,
  upcomingInterviews,
  pastInterviews,
}: {
  applicationOptions: ApplicationOption[];
  upcomingInterviews: RecruiterInterview[];
  pastInterviews: RecruiterInterview[];
}) {
  return (
    <div className="space-y-6">
      <CreateInterviewForm applicationOptions={applicationOptions} />
      <InterviewSection
        title="Upcoming interviews"
        description="Scheduled interviews that still need coordination or completion."
        interviews={upcomingInterviews}
        emptyTitle="No upcoming interviews"
        emptyDescription="Create an interview from an application to add it to the schedule."
      />
      <InterviewSection
        title="Past interviews"
        description="Completed interviews and sessions whose scheduled time has passed."
        interviews={pastInterviews}
        emptyTitle="No past interviews"
        emptyDescription="Completed and elapsed interviews will appear here."
      />
    </div>
  );
}

function CreateInterviewForm({
  applicationOptions,
}: {
  applicationOptions: ApplicationOption[];
}) {
  const [state, formAction] = useActionState(createInterview, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create interview</CardTitle>
        <CardDescription>
          Schedule an interview for one of your job applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applicationOptions.length > 0 ? (
          <form action={formAction} className="space-y-4">
            <ActionMessage state={state} />
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-dark lg:col-span-2">
                Application
                <select
                  name="applicationId"
                  className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
                >
                  {applicationOptions.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.label}
                    </option>
                  ))}
                </select>
              </label>
              <InterviewFields />
            </div>
            <SubmitButton label="Create interview" pendingLabel="Creating..." />
          </form>
        ) : (
          <EmptyState
            title="No applications available"
            description="Applications for your jobs will appear here when candidates apply."
            action={
              <Link
                href="/recruiter/jobs"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-dark hover:border-primary hover:text-primary"
              >
                View Jobs
              </Link>
            }
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function InterviewSection({
  title,
  description,
  interviews,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  interviews: RecruiterInterview[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="primary">{interviews.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {interviews.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

function InterviewCard({ interview }: { interview: RecruiterInterview }) {
  const [state, formAction] = useActionState(updateInterview, initialState);
  const isCompleted = interview.status === "COMPLETED";

  return (
    <article className="rounded-xl border border-border bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-base font-bold text-dark">{interview.title}</h3>
          <p className="mt-1 text-sm font-medium text-muted">
            {interview.candidateName} / {interview.jobTitle}
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            {interview.scheduledAtLabel}
          </p>
        </div>
        <Badge variant={isCompleted ? "success" : "warning"}>
          {formatConstant(interview.status)}
        </Badge>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
        <span>{formatConstant(interview.mode)}</span>
        <span>{interview.durationMins} mins</span>
        <span>{interview.location ?? "No location set"}</span>
        {interview.meetingUrl ? (
          <a
            href={interview.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:text-primary-dark"
          >
            Meeting link
          </a>
        ) : (
          <span>No meeting link</span>
        )}
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <ActionMessage state={state} />
        <input type="hidden" name="interviewId" value={interview.id} />
        <div className="grid gap-4 lg:grid-cols-2">
          <InterviewFields interview={interview} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubmitButton label="Save changes" pendingLabel="Saving..." />
          {!isCompleted ? (
            <button
              type="submit"
              formAction={completeInterview}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-green-100 bg-white px-4 text-sm font-semibold text-success transition-colors hover:bg-green-50"
            >
              Mark completed
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}

function InterviewFields({
  interview,
}: {
  interview?: RecruiterInterview;
}) {
  return (
    <>
      <Field
        label="Title"
        name="title"
        defaultValue={interview?.title ?? ""}
        placeholder="Technical interview"
      />
      <Field
        label="Date and time"
        name="scheduledAt"
        type="datetime-local"
        defaultValue={interview?.scheduledAtInput ?? ""}
      />
      <Field
        label="Duration"
        name="durationMins"
        type="number"
        defaultValue={interview?.durationMins.toString() ?? "30"}
      />
      <label className="grid gap-2 text-sm font-semibold text-dark">
        Mode
        <select
          name="mode"
          defaultValue={interview?.mode ?? "VIDEO"}
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
        >
          {interviewModes.map((mode) => (
            <option key={mode} value={mode}>
              {formatConstant(mode)}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Meeting URL"
        name="meetingUrl"
        defaultValue={interview?.meetingUrl ?? ""}
        placeholder="https://meet.example.com/session"
      />
      <Field
        label="Location"
        name="location"
        defaultValue={interview?.location ?? ""}
        placeholder="Remote or office address"
      />
      <label className="grid gap-2 text-sm font-semibold text-dark lg:col-span-2">
        Notes
        <textarea
          name="feedback"
          defaultValue={interview?.feedback ?? ""}
          rows={4}
          placeholder="Private interview notes or feedback"
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-dark">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={type === "number" ? 15 : undefined}
        className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ActionMessage({ state }: { state: InterviewActionState }) {
  if (!state.error) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-danger">
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
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
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
