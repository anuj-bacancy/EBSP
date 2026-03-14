// @ts-nocheck
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const KYC_BUCKET = "kyc-documents";

async function ensureKycBucket() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  await admin.storage
    .createBucket(KYC_BUCKET, {
      public: false,
      fileSizeLimit: 5 * 1024 * 1024,
    })
    .catch(() => null);

  return admin;
}

export async function uploadKycDocument(input: {
  partnerId: string;
  endUserId: string;
  documentType: string;
  fileName: string;
  fileContent: ArrayBuffer;
  contentType: string;
}) {
  const admin = await ensureKycBucket();
  const storagePath = `${input.partnerId}/${input.endUserId}/${Date.now()}-${input.fileName}`;

  const { error: uploadError } = await admin.storage.from(KYC_BUCKET).upload(storagePath, input.fileContent, {
    contentType: input.contentType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await admin
    .from("kyc_documents")
    .insert({
      partner_id: input.partnerId,
      end_user_id: input.endUserId,
      document_type: input.documentType,
      storage_path: `${KYC_BUCKET}/${storagePath}`,
      metadata: {
        fileName: input.fileName,
        contentType: input.contentType,
      },
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to persist KYC document");
  }

  return data;
}

export async function getKycDocumentUrl(storagePath: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const normalizedPath = storagePath.startsWith(`${KYC_BUCKET}/`)
    ? storagePath.slice(KYC_BUCKET.length + 1)
    : storagePath;

  const { data, error } = await admin.storage.from(KYC_BUCKET).createSignedUrl(normalizedPath, 60 * 10);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}
