import { Notice, Plugin, setIcon } from "obsidian";
import { DEFAULT_SETTINGS, MyPluginSettings, FileChange } from "./types";
import { SYNC_INTERVAL_MS } from "./constants";
import { SettingsTab } from "./settings";
import { getClient } from "./client";
import { Debouncer } from "./helpers/debounce";
import { type Files } from "files-sdk";
import { createDatabase, initializeSchemas, closeDatabase, type BetterSyncDatabase } from "./db/client";

export default class BetterSyncPlugin extends Plugin {
	settings: MyPluginSettings;
	private isSyncing: boolean = false;
	private statusBarItem: HTMLElement;
	private client: Files | null = null;
	private isFirstSync: boolean = true;
	private debouncer: Debouncer;
	private db: BetterSyncDatabase;

	async onload(): Promise<void> {
		this.db = createDatabase(this.manifest.dir!);
		initializeSchemas(this.db);
		await this.loadSettings();
		this.initializeClient();
		this.setupUI();
		this.setupCommands();
		this.setupVaultEvents();
		this.debouncer = new Debouncer((changes) => this.pushToCloud(changes));
		this.sync();
		this.registerInterval(window.setInterval(() => this.pullFromCloud(), SYNC_INTERVAL_MS));
	}

	onunload(): void {
		this.debouncer.cancel();
		closeDatabase(this.db);
	}

	private setupVaultEvents(): void {
		this.registerEvent(this.app.vault.on("create", (file) => this.debouncer.queue(file.path, "create")));
		this.registerEvent(this.app.vault.on("modify", (file) => this.debouncer.queue(file.path, "modify")));
		this.registerEvent(this.app.vault.on("delete", (file) => this.debouncer.queue(file.path, "delete")));
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				this.debouncer.queue(file.path, "rename");
				this.debouncer.queue(oldPath, "delete");
			}),
		);
	}

	initializeClient(): void {
		const syncProvider = this.settings.syncProvider;
		const credentials = this.settings.credentials;
		this.client = getClient(syncProvider, credentials);
	}

	private async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private setupUI(): void {
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.addClass("better-sync-status");
		setIcon(this.statusBarItem, "refresh-cw");
		this.statusBarItem.setAttr("aria-label", "Better Sync files");
		// this.statusBarItem.addEventListener("click", () => this.normalSync());
		this.statusBarItem.hide();

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	private setupCommands(): void {
		this.addCommand({
			id: "sync-now",
			name: "Sync files now",
			callback: () => this.normalSync(this.debouncer.getPendingChanges),
		});
	}

	private async pushToCloud(changes: FileChange[]): Promise<void> {
		if (!this.basicChecksBeforeSync()) return;

		if (changes.length === 0) return;

		console.log("Pushing changes to cloud...");
		for (const change of changes) {
			console.log(`  - ${change.action}: ${change.path}`);
		}
		this.startSyncing();

		try {
			for (const change of changes) {
				switch (change.action) {
					case "create":
						await this.createFileOnCloud(change.path);
						break;
					case "modify":
						await this.modifyFileOnCloud(change.path);
						break;
					case "rename":
						await this.uploadFileOnCloud(change.path);
						break;
					case "delete":
						await this.deleteFileOnCloud(change.path);
						break;
				}
			}
		} catch (e) {
		} finally {
			this.stopSyncing();
		}
	}

	private async pullFromCloud(): Promise<void> { }

	private async normalSync(changes?: FileChange[]): Promise<void> { }

	private async startInitialSync(): Promise<void> {
		if (!this.basicChecksBeforeSync()) {
			return;
		}

		console.log("Starting initial sync...");
		this.startSyncing();
		try {
			// sync both local and cloud
			const cloudFiles = await this.client!.list();
			const files = this.app.vault.getMarkdownFiles();

			for (const file of files) {
				if (!file) continue;
				await this.app.vault.cachedRead(file);
			}
		} catch (error) {
			console.error("Error during initial sync:", error);
			new Notice("Error during initial sync. Check console for details.");
		} finally {
			this.stopSyncing();
		}
	}

	private async sync(): Promise<void> {
		if (this.isFirstSync) {
			this.startInitialSync();
			this.isFirstSync = false;
		} else {
			this.normalSync();
		}
	}

	private async basicChecksBeforeSync() {
		if (!this.client) {
			return false;
		}
		if (this.isSyncing) {
			return false;
		}
		return true;
	}

	private startSyncing(): void {
		this.isSyncing = true;
		this.statusBarItem.show();
		this.statusBarItem.addClass("is-syncing");
	}

	private stopSyncing(): void {
		this.isSyncing = false;
		this.statusBarItem.removeClass("is-syncing");
		this.statusBarItem.hide();
	}

	private async createFileOnCloud(path: string): Promise<void> { }

	private async modifyFileOnCloud(path: string): Promise<void> { }

	private async uploadFileOnCloud(path: string): Promise<void> { }

	private async deleteFileOnCloud(path: string): Promise<void> { }
}
