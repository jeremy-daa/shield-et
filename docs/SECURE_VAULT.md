1. Authentication: Anonymous Guest Sessions
To ensure maximum safety, users must be able to save evidence without providing an email, phone number, or name.

Requirement: Upon the first time a user enters the "Portal," the app must check for an active session. If none exists, call account.createAnonymousSession().

Persistence: This session is tied to the user's Telegram browser/PWA instance.

Conversion: Provide a subtle option to "Upgrade to Account" (Email/Password) if the user wants to access their vault from a different device later.

2. Storage Architecture: The "Safe Bucket"
Configure the Appwrite Storage Bucket with the following settings:

Encryption at Rest: MUST BE ENABLED in the Appwrite Console (Bucket Settings > Security). This ensures that even if the physical server is compromised, the files are unreadable.

File Security (Permissions): Enable "File Security" at the bucket level.

Permission Logic: When a user uploads a file, the code must explicitly set permissions so only that specific user ID can read or delete it.

Permission.read(Role.user(userId))

Permission.delete(Role.user(userId))

Do not grant Role.any() or Role.users() access.

3. Zero-Knowledge "Camouflage" for Files
The AI agent must ensure that evidence never touches the user's public phone storage (Gallery/Camera Roll).

Direct Upload: Use the browser's File API to upload directly from the camera/microphone buffer to Appwrite.

Filename Masking: Automatically rename files to something neutral (e.g., IMG_WEATHER_DATA_2025.jpg or DOC_TEMP_302.pdf) before uploading, so if a network log is intercepted, it looks like standard app data.

Thumbnail Handling: Avoid generating thumbnails in the browser that might be cached in a public "recent images" folder.

4. Implementation Pattern: Secure Upload
TypeScript

// AI Agent: Use this logic in /src/components/vault/EvidenceUploader.tsx
import { storage, ID, Permission, Role } from '@/lib/appwrite';

const uploadEvidence = async (file: File, userId: string) => {
  try {
    const result = await storage.createFile(
      '[BUCKET_ID]',
      ID.unique(),
      file,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return result;
  } catch (error) {
    console.error("Secure upload failed. Error disguised as network timeout.");
  }
};
5. Metadata & Database Sync
Sensitive details (like the "Description" of an incident) should be stored in an Appwrite Database Collection with "Encrypted String Attributes" (available on Appwrite Pro/Cloud).

Encrypted Attributes: Use these for the description, incident_date, and location fields.

Linkage: Store the fileId from Storage in the Database document to link the metadata to the media.