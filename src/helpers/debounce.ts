import { SYNC_DEBOUNCE_MS } from "../constants";
import type { FileChange, FileChangeAction } from "../types";

export class Debouncer {
	private pendingChanges: Map<string, FileChange> = new Map();
	private debounceTimer: number | null = null;
	private readonly debounceMs: number;
	private onFlush: (changes: FileChange[]) => void;

	constructor(onFlush: (changes: FileChange[]) => void) {
		this.debounceMs = SYNC_DEBOUNCE_MS;
		this.onFlush = onFlush;
	}

	queue(path: string, action: FileChangeAction): void {
		const existing = this.pendingChanges.get(path);

		if (existing) {
			// Smart deduplication
			if (existing.action === "create" && action === "delete") {
				this.pendingChanges.delete(path);
				return;
			}
			if (existing.action === "delete" && action === "create") {
				// Delete then create = update, keep the path
			}
		}

		this.pendingChanges.set(path, { path, action });

		this.resetTimer();
	}

	private resetTimer(): void {
		if (this.debounceTimer !== null) {
			window.clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = window.setTimeout(() => {
			this.debounceTimer = null;
			this.flush();
		}, this.debounceMs);
	}

	private flush(): void {
		if (this.pendingChanges.size === 0) return;

		const changes = Array.from(this.pendingChanges.values());
		this.pendingChanges.clear();

		for (const change of changes) {
			console.log(`  - ${change.action}: ${change.path}`);
		}

		this.onFlush(changes);
	}

	cancel(): void {
		if (this.debounceTimer !== null) {
			window.clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
		this.pendingChanges.clear();
	}

	get getSize(): number {
		return this.pendingChanges.size;
	}

	get getPendingChanges(): FileChange[] {
		return Array.from(this.pendingChanges.values());
	}
}
