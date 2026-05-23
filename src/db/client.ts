import Database from "better-sqlite3";
import { join } from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// Schema definitions - single source of truth
export const metadata = sqliteTable(
	"metadata",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		filePath: text("file_path").notNull().unique(),
		lastSyncedAt: integer("last_synced_at"),
		fileHash: text("file_hash"),
		fileSize: integer("file_size"),
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(strftime('%s', 'now'))`),
	},
	(table) => [uniqueIndex("idx_metadata_file_path").on(table.filePath)],
);

export const syncQueue = sqliteTable(
	"sync_queue",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		filePath: text("file_path").notNull(),
		operation: text("operation", {
			enum: ["create", "update", "delete"],
		}).notNull(),
		status: text("status", {
			enum: ["pending", "in_progress", "completed", "failed"],
		})
			.notNull()
			.default("pending"),
		retryCount: integer("retry_count").notNull().default(0),
		errorMessage: text("error_message"),
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(strftime('%s', 'now'))`),
	},
	(table) => [index("idx_sync_queue_status").on(table.status), index("idx_sync_queue_file_path").on(table.filePath)],
);

// Database type
export type MetadataRecord = typeof metadata.$inferSelect;
export type SyncQueueRecord = typeof syncQueue.$inferSelect;
export type NewMetadataRecord = typeof metadata.$inferInsert;
export type NewSyncQueueRecord = typeof syncQueue.$inferInsert;

export interface BetterSyncDatabase {
	sqlite: Database.Database;
	drizzle: ReturnType<typeof drizzle>;
}

export function createDatabase(pluginPath: string): BetterSyncDatabase {
	const dbPath = join(pluginPath, "better-sync.db");
	const sqlite = new Database(dbPath);

	// Enable WAL mode for better performance
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");

	const db = drizzle(sqlite);

	return { sqlite, drizzle: db };
}

// For plugin use, we use a simple schema push approach
export function initializeSchemas(db: BetterSyncDatabase): void {
	// Use Drizzle's push approach - create tables based on schema definitions
	// This is simpler than full migrations for a plugin

	// Execute DDL using raw sqlite
	db.sqlite.exec(`
		CREATE TABLE IF NOT EXISTS metadata (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			file_path TEXT NOT NULL UNIQUE,
			last_synced_at INTEGER,
			file_hash TEXT,
			file_size INTEGER,
			created_at INTEGER DEFAULT (strftime('%s', 'now')),
			updated_at INTEGER DEFAULT (strftime('%s', 'now'))
		)
	`);

	db.sqlite.exec(`
		CREATE TABLE IF NOT EXISTS sync_queue (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			file_path TEXT NOT NULL,
			operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
			retry_count INTEGER NOT NULL DEFAULT 0,
			error_message TEXT,
			created_at INTEGER DEFAULT (strftime('%s', 'now'))
		)
	`);

	db.sqlite.exec(`
		CREATE INDEX IF NOT EXISTS idx_metadata_file_path ON metadata(file_path);
		CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
		CREATE INDEX IF NOT EXISTS idx_sync_queue_file_path ON sync_queue(file_path);
	`);
}

export function closeDatabase(db: BetterSyncDatabase): void {
	db.sqlite.close();
}

// Helper functions using Drizzle ORM
export async function upsertMetadata(
	db: BetterSyncDatabase,
	filePath: string,
	data: Partial<Omit<MetadataRecord, "id" | "filePath">>
) {
	return db.drizzle
		.insert(metadata)
		.values({
			filePath,
			...data,
		})
		.onConflictDoUpdate({
			target: metadata.filePath,
			set: {
				...data,
				updatedAt: Math.floor(Date.now() / 1000),
			},
		})
		.returning();
}

export async function addToSyncQueue(
	db: BetterSyncDatabase,
	filePath: string,
	operation: "create" | "update" | "delete",
	priority: number = 0
) {
	return db.drizzle
		.insert(syncQueue)
		.values({
			filePath,
			operation,
			status: "pending",
			retryCount: 0,
			createdAt: Math.floor(Date.now() / 1000),
		})
		.returning();
}

export async function getPendingSyncItems(db: BetterSyncDatabase, limit: number = 50) {
	return db.drizzle
		.select()
		.from(syncQueue)
		.where(sql`${syncQueue.status} = 'pending'`)
		.orderBy(sql`${syncQueue.createdAt} ASC`)
		.limit(limit);
}

export async function updateSyncItemStatus(
	db: BetterSyncDatabase,
	id: number,
	status: "pending" | "in_progress" | "completed" | "failed",
	errorMessage?: string
) {
	return db.drizzle
		.update(syncQueue)
		.set({
			status,
			errorMessage: errorMessage ?? null,
		})
		.where(sql`${syncQueue.id} = ${id}`)
		.returning();
}

export async function getMetadataByPath(db: BetterSyncDatabase, filePath: string) {
	return db.drizzle
		.select()
		.from(metadata)
		.where(sql`${metadata.filePath} = ${filePath}`)
		.limit(1);
}