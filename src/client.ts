import { Files } from "files-sdk";
import { s3 } from "files-sdk/s3";
import { r2 } from "files-sdk/r2";
import { minio } from "files-sdk/minio";
import { hetzner } from "files-sdk/hetzner";
import { vercelBlob } from "files-sdk/vercel-blob";
import { bunnyStorage } from "files-sdk/bunny-storage";
import type { BunnyStorageRegion } from "files-sdk/bunny-storage";
import { uploadthing } from "files-sdk/uploadthing";
import { supabase } from "files-sdk/supabase";
import { googleDrive } from "files-sdk/google-drive";
import { dropbox } from "files-sdk/dropbox";
import { cloudinary } from "files-sdk/cloudinary";
import type { CloudinaryDeliveryType, CloudinaryResourceType } from "files-sdk/cloudinary";
import { firebaseStorage } from "files-sdk/firebase-storage";
import { appwrite } from "files-sdk/appwrite";
import { gcs } from "files-sdk/gcs";
import { azure } from "files-sdk/azure";

import { ProviderName } from "types";

const BUCKET_NAME = "obsidian-better-sync";
const optional = (value: string | undefined): string | undefined => value || undefined;
const bool = (value: string | undefined): boolean => value === "true";
const privateKey = (value: string | undefined): string | undefined => optional(value)?.replace(/\\n/g, "\n");

export const getClient = (adapter: ProviderName, credentials: Record<string, string>): Files | null => {
	try {
		switch (adapter) {
			case "s3":
				return new Files({
					adapter: s3({
						bucket: BUCKET_NAME,
						region: credentials.AWS_REGION,
						credentials: {
							accessKeyId: credentials.AWS_ACCESS_KEY_ID!,
							secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY!,
							sessionToken: credentials.AWS_SESSION_TOKEN,
						},
					}),
				});
			case "r2":
				return new Files({
					adapter: r2({
						bucket: BUCKET_NAME,
						accountId: credentials.R2_ACCOUNT_ID!,
						accessKeyId: credentials.R2_ACCESS_KEY_ID!,
						secretAccessKey: credentials.R2_SECRET_ACCESS_KEY!,
					}),
				});
			case "vercel-blob":
				return new Files({
					adapter: vercelBlob({
						token: credentials.BLOB_READ_WRITE_TOKEN!,
						access: credentials.VERCEL_BLOB_ACCESS === "private" ? "private" : "public",
					}),
				});
			case "minio":
				return new Files({
					adapter: minio({
						bucket: BUCKET_NAME,
						endpoint: credentials.MINIO_ENDPOINT!,
						region: credentials.MINIO_REGION,
						accessKeyId: credentials.MINIO_ACCESS_KEY_ID!,
						secretAccessKey: credentials.MINIO_SECRET_ACCESS_KEY!,
					}),
				});
			case "hetzner":
				return new Files({
					adapter: hetzner({
						bucket: BUCKET_NAME,
						region: credentials.HCLOUD_REGION!,
						endpoint: credentials.HCLOUD_ENDPOINT,
						accessKeyId: credentials.HCLOUD_ACCESS_KEY_ID!,
						secretAccessKey: credentials.HCLOUD_SECRET_ACCESS_KEY!,
					}),
				});
			case "bunny-storage":
				return new Files({
					adapter: bunnyStorage({
						zone: credentials.BUNNY_STORAGE_ZONE!,
						region: credentials.BUNNY_STORAGE_REGION as BunnyStorageRegion | undefined,
						accessKey: credentials.BUNNY_STORAGE_ACCESS_KEY!,
					}),
				});
			case "uploadthing":
				return new Files({
					adapter: uploadthing({
						token: credentials.UPLOADTHING_TOKEN!,
						acl: credentials.UPLOADTHING_ACL === "private" ? "private" : "public-read",
						slug: optional(credentials.UPLOADTHING_SLUG),
						region: optional(credentials.UPLOADTHING_REGION),
					}),
				});
			case "supabase":
				return new Files({
					adapter: supabase({
						bucket: optional(credentials.SUPABASE_BUCKET) ?? BUCKET_NAME,
						url: credentials.SUPABASE_URL!,
						key: optional(credentials.SUPABASE_SERVICE_ROLE_KEY) ?? credentials.SUPABASE_KEY!,
						public: bool(credentials.SUPABASE_PUBLIC_BUCKET),
						publicBaseUrl: optional(credentials.SUPABASE_PUBLIC_BASE_URL),
					}),
				});
			case "google-drive": {
				const key = privateKey(credentials.GOOGLE_DRIVE_PRIVATE_KEY);
				return new Files({
					adapter: googleDrive({
						...(credentials.GOOGLE_DRIVE_CLIENT_EMAIL && key
							? {
									credentials: {
										client_email: credentials.GOOGLE_DRIVE_CLIENT_EMAIL,
										private_key: key,
									},
								}
							: {}),
						keyFilename: optional(credentials.GOOGLE_DRIVE_KEY_FILE),
						subject: optional(credentials.GOOGLE_DRIVE_SUBJECT),
						driveId: credentials.GOOGLE_DRIVE_ID!,
						rootFolderId: optional(credentials.GOOGLE_DRIVE_ROOT_FOLDER_ID),
						publicByDefault: bool(credentials.GOOGLE_DRIVE_PUBLIC_BY_DEFAULT),
					}),
				});
			}
			case "dropbox":
				return new Files({
					adapter: dropbox({
						accessToken: optional(credentials.DROPBOX_ACCESS_TOKEN),
						refreshToken: optional(credentials.DROPBOX_REFRESH_TOKEN),
						appKey: optional(credentials.DROPBOX_APP_KEY),
						appSecret: optional(credentials.DROPBOX_APP_SECRET),
						rootFolderPath: optional(credentials.DROPBOX_ROOT_FOLDER_PATH),
						publicByDefault: bool(credentials.DROPBOX_PUBLIC_BY_DEFAULT),
						publicBaseUrl: optional(credentials.DROPBOX_PUBLIC_BASE_URL),
					}),
				});
			case "cloudinary":
				return new Files({
					adapter: cloudinary({
						cloudName: optional(credentials.CLOUDINARY_CLOUD_NAME),
						apiKey: optional(credentials.CLOUDINARY_API_KEY),
						apiSecret: optional(credentials.CLOUDINARY_API_SECRET),
						resourceType: (optional(credentials.CLOUDINARY_RESOURCE_TYPE) ?? "raw") as CloudinaryResourceType,
						type: (optional(credentials.CLOUDINARY_DELIVERY_TYPE) ?? "upload") as CloudinaryDeliveryType,
					}),
				});
			case "firebase-storage": {
				const key = privateKey(credentials.FIREBASE_PRIVATE_KEY);
				return new Files({
					adapter: firebaseStorage({
						bucket: optional(credentials.FIREBASE_STORAGE_BUCKET) ?? BUCKET_NAME,
						projectId: optional(credentials.FIREBASE_PROJECT_ID),
						...(credentials.FIREBASE_CLIENT_EMAIL && key
							? {
									credentials: {
										clientEmail: credentials.FIREBASE_CLIENT_EMAIL,
										privateKey: key,
									},
								}
							: {}),
						serviceAccountPath: optional(credentials.GOOGLE_APPLICATION_CREDENTIALS),
						publicBaseUrl: optional(credentials.FIREBASE_PUBLIC_BASE_URL),
					}),
				});
			}
			case "appwrite":
				return new Files({
					adapter: appwrite({
						bucket: optional(credentials.APPWRITE_BUCKET) ?? BUCKET_NAME,
						endpoint: optional(credentials.APPWRITE_ENDPOINT),
						projectId: credentials.APPWRITE_PROJECT_ID!,
						key: credentials.APPWRITE_API_KEY!,
						public: bool(credentials.APPWRITE_PUBLIC_BUCKET),
					}),
				});
			case "gcs": {
				const key = privateKey(credentials.GOOGLE_CLOUD_PRIVATE_KEY);
				return new Files({
					adapter: gcs({
						bucket: optional(credentials.GCS_BUCKET) ?? BUCKET_NAME,
						projectId: optional(credentials.GOOGLE_CLOUD_PROJECT),
						keyFilename: optional(credentials.GOOGLE_APPLICATION_CREDENTIALS),
						...(credentials.GOOGLE_CLOUD_CLIENT_EMAIL && key
							? {
									credentials: {
										client_email: credentials.GOOGLE_CLOUD_CLIENT_EMAIL,
										private_key: key,
									},
								}
							: {}),
						publicBaseUrl: optional(credentials.GCS_PUBLIC_BASE_URL),
					}),
				});
			}
			case "azure":
				return new Files({
					adapter: azure({
						container: optional(credentials.AZURE_STORAGE_CONTAINER) ?? BUCKET_NAME,
						connectionString: optional(credentials.AZURE_STORAGE_CONNECTION_STRING),
						accountName: optional(credentials.AZURE_STORAGE_ACCOUNT_NAME),
						accountKey: optional(credentials.AZURE_STORAGE_ACCOUNT_KEY),
						sasToken: optional(credentials.AZURE_STORAGE_SAS_TOKEN),
						endpoint: optional(credentials.AZURE_STORAGE_ENDPOINT),
						publicBaseUrl: optional(credentials.AZURE_PUBLIC_BASE_URL),
					}),
				});

			default:
				return null;
		}
	} catch (error) {
		console.error("Error initializing client:", error);
		return null;
	}
};
