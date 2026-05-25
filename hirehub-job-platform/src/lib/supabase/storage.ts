import "server-only";
import { createClient } from "@supabase/supabase-js";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadCandidateCv(file: File, userId: string) {
  if (!file || file.size === 0) {
    throw new Error("Please choose a CV file to upload.");
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    throw new Error("CV file must be 5MB or smaller.");
  }

  if (!ALLOWED_CV_TYPES.includes(file.type)) {
    throw new Error("CV must be a PDF or Word document.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "resumes";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase Storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const extension = getExtension(file.name);
  const filePath = `${userId}/cv-${Date.now()}${extension}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function getExtension(fileName: string) {
  const extension = fileName.split(".").pop();
  return extension ? `.${extension}` : "";
}
