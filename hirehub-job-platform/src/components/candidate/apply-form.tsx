"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitApplication,
  type ApplyActionState,
} from "@/app/candidate/apply/actions";

const initialState: ApplyActionState = {};

export function ApplyForm({
  jobId,
  resumeUrl,
  alreadyApplied,
}: {
  jobId: string;
  resumeUrl: string | null;
  alreadyApplied: boolean;
}) {
  const [state, formAction] = useActionState(submitApplication, initialState);

  if (alreadyApplied) {
    return (
      <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-success">
        You have already applied to this job.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </div>
      ) : null}
      <input type="hidden" name="jobId" value={jobId} />

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Cover letter
        <textarea
          name="coverLetter"
          rows={8}
          placeholder="Write a short note for the recruiter"
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <div className="rounded-xl border border-border bg-slate-50 p-4">
        <label className="flex items-start gap-3 text-sm font-semibold text-dark">
          <input
            type="checkbox"
            name="useExistingCv"
            defaultChecked={Boolean(resumeUrl)}
            disabled={!resumeUrl}
            className="mt-1 size-4 rounded border-border text-primary"
          />
          <span>
            Use uploaded CV by default
            <span className="block text-xs font-medium text-muted">
              {resumeUrl
                ? "Your profile CV will be attached unless you upload a new one below."
                : "No uploaded CV found. Upload a CV below to continue."}
            </span>
          </span>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-dark">
        Upload new CV
        <input
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
        />
      </label>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit application"}
    </button>
  );
}
