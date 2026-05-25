import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell";
import {
  BasicProfileForm,
  CvUploadForm,
  EducationForm,
  SkillsForm,
  WorkExperienceForm,
} from "@/components/candidate/profile-forms";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Candidate Profile | HireHub",
};

export default async function CandidateProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const prisma = getPrisma();
  const [firstName, ...lastNameParts] = user.name.split(" ");
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      firstName: firstName || "Candidate",
      lastName: lastNameParts.join(" ") || "User",
    },
    include: {
      skills: { orderBy: { name: "asc" } },
      education: { orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }] },
      workExperience: {
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
      },
    },
  });

  const profileCompletion = getProfileCompletion(profile);
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <DashboardPageHeader
        title="Profile"
        description="Manage your candidate profile, CV, skills, education, and work experience."
      />

      <section className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-3xl">{profileCompletion}%</CardTitle>
            <CardDescription>Profile completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-primary transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={profile.resumeUrl ? "success" : "warning"}>
                CV {profile.resumeUrl ? "uploaded" : "missing"}
              </Badge>
              <Badge variant={profile.skills.length > 0 ? "success" : "warning"}>
                {profile.skills.length} skills
              </Badge>
              <Badge
                variant={profile.education.length > 0 ? "success" : "warning"}
              >
                {profile.education.length} education
              </Badge>
              <Badge
                variant={
                  profile.workExperience.length > 0 ? "success" : "warning"
                }
              >
                {profile.workExperience.length} experience
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <BasicProfileForm
            fullName={fullName}
            phone={profile.phone ?? ""}
            address={profile.address ?? ""}
            bio={profile.bio ?? ""}
          />
          <CvUploadForm resumeUrl={profile.resumeUrl} />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <SkillsForm skills={profile.skills} />
        <EducationForm
          education={profile.education.map((item) => ({
            ...item,
            startDate: formatInputDate(item.startDate),
            endDate: formatInputDate(item.endDate),
          }))}
        />
      </section>

      <section className="mt-6">
        <WorkExperienceForm
          workExperience={profile.workExperience.map((item) => ({
            ...item,
            startDate: formatInputDate(item.startDate),
            endDate: formatInputDate(item.endDate),
          }))}
        />
      </section>
    </>
  );
}

function getProfileCompletion(profile: {
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  resumeUrl: string | null;
  skills: unknown[];
  education: unknown[];
  workExperience: unknown[];
}) {
  const checks = [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.address,
    profile.bio,
    profile.resumeUrl,
    profile.skills.length > 0,
    profile.education.length > 0,
    profile.workExperience.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function formatInputDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}
