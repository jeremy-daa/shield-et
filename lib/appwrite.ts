import { Client, Account, Databases, Storage, ID } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Debug: Log AppWrite configuration
if (typeof window !== "undefined") {
  console.log("[AppWrite] Client configured:");
  console.log("  Endpoint:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log("  Project:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log("  Using localStorage for sessions");
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper to get resources
export async function getSupportResources() {
  return databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUPPORT_ID!,
  );
}

// Helper to log emergency calls
export async function logEmergencyCall(number: string, label: string) {
  let user;
  try {
    user = await account.get();
  } catch {
    // No valid session - cannot log
    console.error("[logEmergencyCall] No valid session to log emergency call");
    return null;
  }

  try {
    // Note: Using a specific collection for logs.
    // If not defined in env, we log to console for dev.
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVIDENCE_ID ||
      "evidence_logs";

    return databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      collectionId,
      ID.unique(),
      {
        userId: user.$id,
        fileId: "no-file-call-log",
        incidentType: "other", // Best fit for a general emergency call
        description: `Emergency SOS Call: ${label} (${number}). Device: ${typeof window !== "undefined" ? window.navigator.userAgent : "unknown"}`,
        timestamp: new Date().toISOString(),
        threatLevel: 5,
        isArchived: false,
      },
    );
  } catch (e) {
    console.error("Failed to log call", e);
  }
}

export async function uploadEvidence(
  file: File | Blob,
  type: "image" | "audio",
  metadata?: {
    description?: string;
    threatLevel?: number;
    incidentType?: string;
  },
) {
  let user;
  try {
    user = await account.get();
  } catch {
    // No valid session - cannot upload
    console.error("[uploadEvidence] No valid session to upload evidence");
    return false;
  }

  try {
    const fileId = ID.unique();
    // 1. Upload to Bucket
    // Determine extension strictly from MIME type
    const mime = file.type;
    let ext = "bin";
    if (mime.includes("image/jpeg")) ext = "jpg";
    else if (mime.includes("image/png")) ext = "png";
    else if (mime.includes("image/webp")) ext = "webp";
    else if (mime.includes("audio/webm")) ext = "webm";
    else if (mime.includes("audio/ogg")) ext = "ogg";
    else if (mime.includes("audio/mp4")) ext = "m4a";
    else if (mime.includes("audio/wav")) ext = "wav";
    else if (mime.includes("audio/mpeg")) ext = "mp3";

    const uploadFile =
      file instanceof File
        ? file
        : new File([file], `${type}_${Date.now()}.${ext}`, { type: mime });

    await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileId,
      uploadFile,
    );

    // 2. Create Metadata
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVIDENCE_ID ||
      "evidence_logs";
    const defaultDesc = `Stealth ${type} capture. Device: ${typeof window !== "undefined" ? window.navigator.userAgent : "unknown"}`;

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      collectionId,
      ID.unique(),
      {
        userId: user.$id,
        fileId: fileId,
        incidentType: metadata?.incidentType || "other",
        description: metadata?.description || defaultDesc,
        timestamp: new Date().toISOString(),
        threatLevel: metadata?.threatLevel || 1,
        isArchived: false,
      },
    );

    return true;
  } catch (e) {
    return false;
  }
}
// Helper to delete JUST the file from storage
export async function deleteEvidenceFile(fileId: string) {
  try {
    if (!fileId || fileId === "no-file-call-log") return false;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (e) {
    console.error("Failed to delete file", e);
    return false;
  }
}

// Helper to update evidence metadata
export async function updateEvidenceDetails(
  documentId: string,
  data: Partial<{
    description: string;
    threatLevel: number;
    incidentType: string;
  }>,
) {
  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId =
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVIDENCE_ID ||
      "evidence_logs";

    await databases.updateDocument(dbId, colId, documentId, data);
    return true;
  } catch (e) {
    console.error("Failed to update evidence", e);
    return false;
  }
}

// Helper to delete ENTIRE evidence (File + Metadata)
export async function deleteEvidence(documentId: string, fileId: string) {
  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId =
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVIDENCE_ID ||
      "evidence_logs";
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    // 1. Delete Metadata
    await databases.deleteDocument(dbId, colId, documentId);

    // 2. Delete File (if valid)
    if (fileId && fileId !== "no-file-call-log") {
      try {
        await storage.deleteFile(bucketId, fileId);
      } catch (err) {
        // Ignore file not found if already deleted
        console.warn("File might already be deleted or missing");
      }
    }

    return true;
  } catch (e) {
    console.error("Failed to delete evidence", e);
    return false;
  }
}

// lib/appwrite.ts
export { ID, Permission, Role, Query } from "appwrite";
