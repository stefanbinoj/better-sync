/**
 * Environment variable schemas for all supported storage providers.
 */

export type FileChangeAction = 'create' | 'modify' | 'delete' | 'rename';

export interface FileChange {
	path: string;
	action: FileChangeAction;
}

/** Map-based change tracker that preserves insertion order */
export type FileChangeTracker = Map<string, FileChange>;

export interface EnvVarSchema {
  key: string;
  isRequired: boolean;
  isSecret: boolean;
  description: string;
}

export const PROVIDER_ENVS = {
  s3: [
    { key: "AWS_ACCESS_KEY_ID", isRequired: true, isSecret: true, description: "AWS access key" },
    { key: "AWS_SECRET_ACCESS_KEY", isRequired: true, isSecret: true, description: "AWS secret key" },
    { key: "AWS_REGION", isRequired: true, isSecret: false, description: "S3 bucket region (e.g., us-east-1)" },
    { key: "AWS_SESSION_TOKEN", isRequired: false, isSecret: true, description: "STS temporary credentials" },
  ],

  r2: [
    { key: "R2_ACCOUNT_ID", isRequired: true, isSecret: false, description: "Cloudflare account ID" },
    { key: "R2_ACCESS_KEY_ID", isRequired: true, isSecret: true, description: "R2 API token" },
    { key: "R2_SECRET_ACCESS_KEY", isRequired: true, isSecret: true, description: "R2 API secret" },
  ],

  "vercel-blob": [
    { key: "BLOB_READ_WRITE_TOKEN", isRequired: true, isSecret: true, description: "Vercel Blob token" },
    { key: "VERCEL_BLOB_ACCESS", isRequired: false, isSecret: false, description: 'Blob access mode: "public" or "private"' },
  ],

  minio: [
    { key: "MINIO_ACCESS_KEY_ID", isRequired: true, isSecret: true, description: "MinIO access key" },
    { key: "MINIO_SECRET_ACCESS_KEY", isRequired: true, isSecret: true, description: "MinIO secret key" },
    { key: "MINIO_ENDPOINT", isRequired: true, isSecret: false, description: "MinIO endpoint URL" },
    { key: "MINIO_REGION", isRequired: false, isSecret: false, description: "MinIO region" },
  ],

  uploadthing: [
    { key: "UPLOADTHING_TOKEN", isRequired: true, isSecret: true, description: "Uploadthing API token" },
    { key: "UPLOADTHING_ACL", isRequired: false, isSecret: false, description: 'Upload ACL: "public-read" or "private"' },
    { key: "UPLOADTHING_SLUG", isRequired: false, isSecret: false, description: "UploadThing file-router slug for signed upload URLs" },
    { key: "UPLOADTHING_REGION", isRequired: false, isSecret: false, description: "UploadThing ingest region alias" },
  ],

  supabase: [
    { key: "SUPABASE_SERVICE_ROLE_KEY", isRequired: false, isSecret: true, description: "Supabase service role key" },
    { key: "SUPABASE_KEY", isRequired: true, isSecret: true, description: "Supabase API key" },
    { key: "SUPABASE_URL", isRequired: true, isSecret: false, description: "Supabase project URL" },
    { key: "SUPABASE_BUCKET", isRequired: false, isSecret: false, description: "Supabase storage bucket" },
    { key: "SUPABASE_PUBLIC_BUCKET", isRequired: false, isSecret: false, description: 'Set to "true" for public buckets' },
    { key: "SUPABASE_PUBLIC_BASE_URL", isRequired: false, isSecret: false, description: "CDN/public base URL for objects" },
  ],

  hetzner: [
    { key: "HCLOUD_ACCESS_KEY_ID", isRequired: true, isSecret: true, description: "Hetzner access key" },
    { key: "HCLOUD_SECRET_ACCESS_KEY", isRequired: true, isSecret: true, description: "Hetzner secret key" },
    { key: "HCLOUD_REGION", isRequired: true, isSecret: false, description: 'Hetzner location code (e.g., "fsn1")' },
    { key: "HCLOUD_ENDPOINT", isRequired: false, isSecret: false, description: "Custom Hetzner object storage endpoint" },
  ],

  "google-drive": [
    { key: "GOOGLE_DRIVE_ID", isRequired: true, isSecret: false, description: "Shared Drive ID or Drive ID" },
    { key: "GOOGLE_DRIVE_ROOT_FOLDER_ID", isRequired: false, isSecret: false, description: "Root folder ID for synced files" },
    { key: "GOOGLE_DRIVE_CLIENT_EMAIL", isRequired: false, isSecret: true, description: "Service account email" },
    { key: "GOOGLE_DRIVE_PRIVATE_KEY", isRequired: false, isSecret: true, description: "Service account private key" },
    { key: "GOOGLE_DRIVE_KEY_FILE", isRequired: false, isSecret: false, description: "Path to service account JSON file" },
    { key: "GOOGLE_DRIVE_SUBJECT", isRequired: false, isSecret: false, description: "Domain-wide delegation subject" },
    { key: "GOOGLE_DRIVE_PUBLIC_BY_DEFAULT", isRequired: false, isSecret: false, description: 'Set to "true" to create public links on upload' },
  ],

  dropbox: [
    { key: "DROPBOX_ACCESS_TOKEN", isRequired: false, isSecret: true, description: "Dropbox access token" },
    { key: "DROPBOX_REFRESH_TOKEN", isRequired: false, isSecret: true, description: "Dropbox OAuth refresh token" },
    { key: "DROPBOX_APP_KEY", isRequired: false, isSecret: false, description: "Dropbox app key for refresh-token auth" },
    { key: "DROPBOX_APP_SECRET", isRequired: false, isSecret: true, description: "Dropbox app secret for confidential clients" },
    { key: "DROPBOX_ROOT_FOLDER_PATH", isRequired: false, isSecret: false, description: "Dropbox folder path to sync under" },
    { key: "DROPBOX_PUBLIC_BY_DEFAULT", isRequired: false, isSecret: false, description: 'Set to "true" to create shared links on upload' },
    { key: "DROPBOX_PUBLIC_BASE_URL", isRequired: false, isSecret: false, description: "CDN/public base URL for objects" },
  ],

  cloudinary: [
    { key: "CLOUDINARY_URL", isRequired: false, isSecret: true, description: "Cloudinary URL" },
    { key: "CLOUDINARY_CLOUD_NAME", isRequired: false, isSecret: false, description: "Cloudinary cloud name" },
    { key: "CLOUDINARY_API_KEY", isRequired: false, isSecret: true, description: "Cloudinary API key" },
    { key: "CLOUDINARY_API_SECRET", isRequired: false, isSecret: true, description: "Cloudinary API secret" },
    { key: "CLOUDINARY_RESOURCE_TYPE", isRequired: false, isSecret: false, description: 'Resource type: "raw", "image", or "video"' },
    { key: "CLOUDINARY_DELIVERY_TYPE", isRequired: false, isSecret: false, description: 'Delivery type: "upload", "private", or "authenticated"' },
  ],

  "firebase-storage": [
    { key: "FIREBASE_STORAGE_BUCKET", isRequired: true, isSecret: false, description: "Firebase bucket" },
    { key: "FIREBASE_PROJECT_ID", isRequired: false, isSecret: false, description: "Firebase/GCP project ID" },
    { key: "FIREBASE_CLIENT_EMAIL", isRequired: false, isSecret: true, description: "Service account email" },
    { key: "FIREBASE_PRIVATE_KEY", isRequired: false, isSecret: true, description: "Service account private key" },
    { key: "GOOGLE_APPLICATION_CREDENTIALS", isRequired: false, isSecret: false, description: "Path to service account JSON" },
    { key: "FIREBASE_PUBLIC_BASE_URL", isRequired: false, isSecret: false, description: "CDN/public base URL for objects" },
  ],

  appwrite: [
    { key: "APPWRITE_BUCKET", isRequired: false, isSecret: false, description: "Appwrite storage bucket ID" },
    { key: "APPWRITE_PROJECT_ID", isRequired: true, isSecret: false, description: "Appwrite project ID" },
    { key: "APPWRITE_API_KEY", isRequired: true, isSecret: true, description: "Appwrite API key" },
    { key: "APPWRITE_ENDPOINT", isRequired: false, isSecret: false, description: "Appwrite endpoint" },
    { key: "APPWRITE_PUBLIC_BUCKET", isRequired: false, isSecret: false, description: 'Set to "true" for public buckets' },
  ],

  gcs: [
    { key: "GCS_BUCKET", isRequired: false, isSecret: false, description: "Google Cloud Storage bucket" },
    { key: "GOOGLE_CLOUD_PROJECT", isRequired: false, isSecret: false, description: "GCP project ID" },
    { key: "GOOGLE_APPLICATION_CREDENTIALS", isRequired: false, isSecret: false, description: "Path to service account JSON" },
    { key: "GOOGLE_CLOUD_CLIENT_EMAIL", isRequired: false, isSecret: true, description: "Service account client email" },
    { key: "GOOGLE_CLOUD_PRIVATE_KEY", isRequired: false, isSecret: true, description: "Service account private key" },
    { key: "GCS_PUBLIC_BASE_URL", isRequired: false, isSecret: false, description: "CDN/public base URL for objects" },
  ],

  "bunny-storage": [
    { key: "BUNNY_STORAGE_ZONE", isRequired: true, isSecret: false, description: "Bunny storage zone" },
    { key: "BUNNY_STORAGE_ACCESS_KEY", isRequired: true, isSecret: true, description: "Bunny access key" },
    { key: "BUNNY_STORAGE_REGION", isRequired: false, isSecret: false, description: "Bunny region" },
  ],

  azure: [
    { key: "AZURE_STORAGE_CONTAINER", isRequired: false, isSecret: false, description: "Azure Blob container" },
    { key: "AZURE_STORAGE_CONNECTION_STRING", isRequired: false, isSecret: true, description: "Azure Storage connection string" },
    { key: "AZURE_STORAGE_ACCOUNT_NAME", isRequired: true, isSecret: false, description: "Azure account name" },
    { key: "AZURE_STORAGE_ACCOUNT_KEY", isRequired: false, isSecret: true, description: "Azure account key" },
    { key: "AZURE_STORAGE_SAS_TOKEN", isRequired: false, isSecret: true, description: "Azure Storage SAS token" },
    { key: "AZURE_STORAGE_ENDPOINT", isRequired: false, isSecret: false, description: "Custom Azure Blob endpoint" },
    { key: "AZURE_PUBLIC_BASE_URL", isRequired: false, isSecret: false, description: "CDN/public base URL for objects" },
  ],
} as const satisfies Record<string, EnvVarSchema[]>;

export type ProviderName = keyof typeof PROVIDER_ENVS;

/** Human-readable labels for display in UI */
export const PROVIDER_LABELS: Record<ProviderName, string> = {
  s3: "AWS S3",
  r2: "Cloudflare R2",
  "vercel-blob": "Vercel Blob",
  minio: "MinIO",
  uploadthing: "Uploadthing",
  supabase: "Supabase Storage",
  hetzner: "Hetzner Object Storage",
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
  cloudinary: "Cloudinary",
  "firebase-storage": "Firebase Storage",
  appwrite: "Appwrite Storage",
  gcs: "Google Cloud Storage",
  "bunny-storage": "Bunny Storage",
  azure: "Azure Blob Storage",
};

/** Provider names sorted alphabetically */
export const PROVIDER_NAMES = Object.keys(PROVIDER_ENVS).toSorted() as ProviderName[];

/** Plugin settings interface */
export interface MyPluginSettings {
  syncProvider: ProviderName;
  credentials: Record<string, string>;
}

/** Default plugin settings */
export const DEFAULT_SETTINGS: MyPluginSettings = {
  syncProvider: "s3",
  credentials: {},
};

/** Helper functions */
export function getRequiredEnvVars(provider: ProviderName): EnvVarSchema[] {
  return PROVIDER_ENVS[provider].filter((v) => v.isRequired);
}

export function getSecretEnvVars(provider: ProviderName): EnvVarSchema[] {
  return PROVIDER_ENVS[provider].filter((v) => v.isSecret);
}
