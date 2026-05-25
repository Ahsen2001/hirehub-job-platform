"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addSkill,
  deleteEducation,
  deleteSkill,
  deleteWorkExperience,
  saveEducation,
  saveWorkExperience,
  updateBasicProfile,
  updateSkill,
  uploadCv,
  type ProfileActionState,
} from "@/app/candidate/profile/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const initialState: ProfileActionState = {};

type Skill = {
  id: string;
  name: string;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
};

type WorkExperience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
};

type BasicProfileFormProps = {
  fullName: string;
  phone: string;
  address: string;
  bio: string;
};

export function BasicProfileForm(props: BasicProfileFormProps) {
  const [state, formAction] = useActionState(updateBasicProfile, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic profile</CardTitle>
        <CardDescription>
          Keep your candidate profile accurate for recruiters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <ActionMessage state={state} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="fullName" defaultValue={props.fullName} />
            <Field label="Phone" name="phone" defaultValue={props.phone} />
          </div>
          <Field label="Address" name="address" defaultValue={props.address} />
          <label className="grid gap-2 text-sm font-semibold text-dark">
            Bio
            <textarea
              name="bio"
              defaultValue={props.bio}
              rows={5}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <SubmitButton label="Save profile" pendingLabel="Saving..." />
        </form>
      </CardContent>
    </Card>
  );
}

export function CvUploadForm({ resumeUrl }: { resumeUrl: string | null }) {
  const [state, formAction] = useActionState(uploadCv, initialState);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>CV upload</CardTitle>
            <CardDescription>
              Upload a PDF or Word document to Supabase Storage.
            </CardDescription>
          </div>
          <Badge variant={resumeUrl ? "success" : "warning"}>
            {resumeUrl ? "Uploaded" : "Missing"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <ActionMessage state={state} />
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
          />
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
            >
              View current CV
            </a>
          ) : null}
          <SubmitButton label="Upload CV" pendingLabel="Uploading..." />
        </form>
      </CardContent>
    </Card>
  );
}

export function SkillsForm({ skills }: { skills: Skill[] }) {
  const [addState, addAction] = useActionState(addSkill, initialState);
  const [updateState, updateAction] = useActionState(updateSkill, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add, edit, or delete profile skills.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={addAction} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <ActionMessage state={addState} />
            <input
              name="name"
              placeholder="Add a skill"
              className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <SubmitButton label="Add skill" pendingLabel="Adding..." />
        </form>

        <ActionMessage state={updateState} />
        {skills.length > 0 ? (
          <div className="grid gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="grid gap-2 rounded-xl border border-border bg-slate-50 p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <form action={updateAction} className="contents">
                  <input type="hidden" name="skillId" value={skill.id} />
                  <input
                    name="name"
                    defaultValue={skill.name}
                    className="h-10 rounded-lg border border-border px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
                  />
                  <SmallSubmitButton label="Update" />
                </form>
                <form action={deleteSkill}>
                  <input type="hidden" name="skillId" value={skill.id} />
                  <DangerButton label="Delete" />
                </form>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No skills yet"
            description="Add skills so recruiters can understand your strengths."
            className="shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}

export function EducationForm({ education }: { education: Education[] }) {
  const [state, formAction] = useActionState(saveEducation, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Add, edit, or delete education records.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ActionMessage state={state} />
        <EducationFields action={formAction} buttonLabel="Add education" />
        <div className="grid gap-4">
          {education.map((item) => (
            <EducationFields
              key={item.id}
              action={formAction}
              education={item}
              buttonLabel="Update"
            />
          ))}
        </div>
        {education.length === 0 ? (
          <EmptyState
            title="No education records"
            description="Add your academic background to improve profile completion."
            className="shadow-none"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export function WorkExperienceForm({
  workExperience,
}: {
  workExperience: WorkExperience[];
}) {
  const [state, formAction] = useActionState(saveWorkExperience, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work experience</CardTitle>
        <CardDescription>Add, edit, or delete work history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ActionMessage state={state} />
        <WorkExperienceFields action={formAction} buttonLabel="Add experience" />
        <div className="grid gap-4">
          {workExperience.map((item) => (
            <WorkExperienceFields
              key={item.id}
              action={formAction}
              workExperience={item}
              buttonLabel="Update"
            />
          ))}
        </div>
        {workExperience.length === 0 ? (
          <EmptyState
            title="No work experience"
            description="Add your work history to help recruiters evaluate your background."
            className="shadow-none"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function EducationFields({
  action,
  education,
  buttonLabel,
}: {
  action: (payload: FormData) => void;
  education?: Education;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={education?.id ?? ""} />
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Institution"
            name="institution"
            defaultValue={education?.institution ?? ""}
          />
          <Field label="Degree" name="degree" defaultValue={education?.degree ?? ""} />
          <Field
            label="Field of study"
            name="fieldOfStudy"
            defaultValue={education?.fieldOfStudy ?? ""}
          />
          <DateField
            label="Start date"
            name="startDate"
            defaultValue={education?.startDate ?? ""}
          />
          <DateField
            label="End date"
            name="endDate"
            defaultValue={education?.endDate ?? ""}
          />
          <CheckboxField
            label="Currently studying"
            name="isCurrent"
            defaultChecked={education?.isCurrent ?? false}
          />
        </div>
        <TextAreaField
          label="Description"
          name="description"
          defaultValue={education?.description ?? ""}
        />
        <div className="flex flex-wrap gap-2">
          <SubmitButton label={buttonLabel} pendingLabel="Saving..." />
          {education ? (
            <DangerButton label="Delete" formAction={deleteEducation} />
          ) : null}
        </div>
      </form>
    </div>
  );
}

function WorkExperienceFields({
  action,
  workExperience,
  buttonLabel,
}: {
  action: (payload: FormData) => void;
  workExperience?: WorkExperience;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={workExperience?.id ?? ""} />
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Company"
            name="company"
            defaultValue={workExperience?.company ?? ""}
          />
          <Field
            label="Job title"
            name="title"
            defaultValue={workExperience?.title ?? ""}
          />
          <Field
            label="Location"
            name="location"
            defaultValue={workExperience?.location ?? ""}
          />
          <DateField
            label="Start date"
            name="startDate"
            defaultValue={workExperience?.startDate ?? ""}
          />
          <DateField
            label="End date"
            name="endDate"
            defaultValue={workExperience?.endDate ?? ""}
          />
          <CheckboxField
            label="Currently working here"
            name="isCurrent"
            defaultChecked={workExperience?.isCurrent ?? false}
          />
        </div>
        <TextAreaField
          label="Description"
          name="description"
          defaultValue={workExperience?.description ?? ""}
        />
        <div className="flex flex-wrap gap-2">
          <SubmitButton label={buttonLabel} pendingLabel="Saving..." />
          {workExperience ? (
            <DangerButton label="Delete" formAction={deleteWorkExperience} />
          ) : null}
        </div>
      </form>
    </div>
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
        className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function DateField({
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
        type="date"
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-lg border border-border px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextAreaField({
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
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 self-end rounded-lg border border-border bg-white px-3 py-3 text-sm font-semibold text-dark">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border text-primary"
      />
      {label}
    </label>
  );
}

function ActionMessage({ state }: { state: ProfileActionState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div
      className={
        state.error
          ? "rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-danger"
          : "rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm font-medium text-success"
      }
    >
      {state.error ?? state.success}
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

function SmallSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function DangerButton({
  label,
  formAction,
}: {
  label: string;
  formAction?: (formData: FormData) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}
