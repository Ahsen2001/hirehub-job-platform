"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/cookies";
import {
  basicProfileSchema,
  educationSchema,
  getFirstIssue,
  recordIdSchema,
  skillIdSchema,
  skillSchema,
  workExperienceSchema,
} from "@/lib/candidate/profile-validation";
import { getPrisma } from "@/lib/prisma";
import { uploadCandidateCv } from "@/lib/supabase/storage";

export type ProfileActionState = {
  success?: string;
  error?: string;
};

export async function updateBasicProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = basicProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: getFirstIssue(parsed.error) };
  }

  const user = await requireCandidate();
  const prisma = getPrisma();
  const [firstName, ...lastNameParts] = parsed.data.fullName.split(" ");

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      firstName,
      lastName: lastNameParts.join(" ") || "User",
      phone: parsed.data.phone,
      address: parsed.data.address,
      bio: parsed.data.bio,
    },
    create: {
      userId: user.id,
      firstName,
      lastName: lastNameParts.join(" ") || "User",
      phone: parsed.data.phone,
      address: parsed.data.address,
      bio: parsed.data.bio,
    },
  });

  revalidateCandidateProfile();
  return { success: "Profile updated successfully." };
}

export async function uploadCv(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireCandidate();
  const file = formData.get("cv");

  if (!(file instanceof File)) {
    return { error: "Please choose a CV file to upload." };
  }

  try {
    const resumeUrl = await uploadCandidateCv(file, user.id);
    await getPrisma().profile.upsert({
      where: { userId: user.id },
      update: { resumeUrl },
      create: {
        userId: user.id,
        firstName: user.name.split(" ")[0] || "Candidate",
        lastName: user.name.split(" ").slice(1).join(" ") || "User",
        resumeUrl,
      },
    });

    revalidateCandidateProfile();
    return { success: "CV uploaded successfully." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to upload CV. Please try again.",
    };
  }
}

export async function addSkill(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = skillSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: getFirstIssue(parsed.error) };
  }

  const profile = await requireProfile();
  const prisma = getPrisma();
  const skill = await prisma.skill.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      skills: {
        connect: { id: skill.id },
      },
    },
  });

  revalidateCandidateProfile();
  return { success: "Skill added." };
}

export async function updateSkill(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const idParsed = skillIdSchema.safeParse({ skillId: formData.get("skillId") });
  const nameParsed = skillSchema.safeParse({ name: formData.get("name") });

  if (!idParsed.success) {
    return { error: getFirstIssue(idParsed.error) };
  }

  if (!nameParsed.success) {
    return { error: getFirstIssue(nameParsed.error) };
  }

  const profile = await requireProfile();
  const prisma = getPrisma();
  const nextSkill = await prisma.skill.upsert({
    where: { name: nameParsed.data.name },
    update: {},
    create: { name: nameParsed.data.name },
  });

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      skills: {
        disconnect: { id: idParsed.data.skillId },
        connect: { id: nextSkill.id },
      },
    },
  });

  revalidateCandidateProfile();
  return { success: "Skill updated." };
}

export async function deleteSkill(formData: FormData) {
  const parsed = skillIdSchema.safeParse({ skillId: formData.get("skillId") });

  if (!parsed.success) {
    return;
  }

  const profile = await requireProfile();
  await getPrisma().profile.update({
    where: { id: profile.id },
    data: {
      skills: {
        disconnect: { id: parsed.data.skillId },
      },
    },
  });

  revalidateCandidateProfile();
}

export async function saveEducation(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const id = normalizeOptionalString(formData.get("id"));
  const parsed = educationSchema.safeParse({
    id,
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: getFirstIssue(parsed.error) };
  }

  const profile = await requireProfile();
  const prisma = getPrisma();
  const data = {
    institution: parsed.data.institution,
    degree: parsed.data.degree,
    fieldOfStudy: parsed.data.fieldOfStudy,
    startDate: parsed.data.startDate,
    endDate: parsed.data.isCurrent ? undefined : parsed.data.endDate,
    isCurrent: parsed.data.isCurrent,
    description: parsed.data.description,
  };

  if (parsed.data.id) {
    await prisma.education.update({
      where: { id: parsed.data.id, profileId: profile.id },
      data,
    });
    revalidateCandidateProfile();
    return { success: "Education updated." };
  }

  await prisma.education.create({
    data: {
      ...data,
      profileId: profile.id,
    },
  });

  revalidateCandidateProfile();
  return { success: "Education added." };
}

export async function deleteEducation(formData: FormData) {
  const parsed = recordIdSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return;
  }

  const profile = await requireProfile();
  await getPrisma().education.delete({
    where: { id: parsed.data.id, profileId: profile.id },
  });
  revalidateCandidateProfile();
}

export async function saveWorkExperience(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const id = normalizeOptionalString(formData.get("id"));
  const parsed = workExperienceSchema.safeParse({
    id,
    company: formData.get("company"),
    title: formData.get("title"),
    location: formData.get("location"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: getFirstIssue(parsed.error) };
  }

  const profile = await requireProfile();
  const prisma = getPrisma();
  const data = {
    company: parsed.data.company,
    title: parsed.data.title,
    location: parsed.data.location,
    startDate: parsed.data.startDate,
    endDate: parsed.data.isCurrent ? undefined : parsed.data.endDate,
    isCurrent: parsed.data.isCurrent,
    description: parsed.data.description,
  };

  if (parsed.data.id) {
    await prisma.workExperience.update({
      where: { id: parsed.data.id, profileId: profile.id },
      data,
    });
    revalidateCandidateProfile();
    return { success: "Work experience updated." };
  }

  await prisma.workExperience.create({
    data: {
      ...data,
      profileId: profile.id,
    },
  });

  revalidateCandidateProfile();
  return { success: "Work experience added." };
}

export async function deleteWorkExperience(formData: FormData) {
  const parsed = recordIdSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return;
  }

  const profile = await requireProfile();
  await getPrisma().workExperience.delete({
    where: { id: parsed.data.id, profileId: profile.id },
  });
  revalidateCandidateProfile();
}

async function requireCandidate() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CANDIDATE") {
    redirect("/unauthorized");
  }

  return user;
}

async function requireProfile() {
  const user = await requireCandidate();
  const [firstName, ...lastNameParts] = user.name.split(" ");

  return getPrisma().profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      firstName: firstName || "Candidate",
      lastName: lastNameParts.join(" ") || "User",
    },
    select: { id: true },
  });
}

function revalidateCandidateProfile() {
  revalidatePath("/candidate/profile");
  revalidatePath("/candidate/dashboard");
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
