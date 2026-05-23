import { App, PluginSettingTab, Setting, SecretComponent } from "obsidian";
import BetterSyncPlugin from "./main";
import { ProviderName, PROVIDER_NAMES, PROVIDER_LABELS, PROVIDER_ENVS } from "./types";

export class SettingsTab extends PluginSettingTab {
	plugin: BetterSyncPlugin;
	private credentialContainer: HTMLElement;

	constructor(app: App, plugin: BetterSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Provider dropdown
		new Setting(containerEl)
			.setName("Sync Provider")
			.setDesc("Select where to sync your files")
			.addDropdown((dropdown) => {
				for (const provider of PROVIDER_NAMES) {
					dropdown.addOption(provider, PROVIDER_LABELS[provider]);
				}

				dropdown.setValue(this.plugin.settings.syncProvider);

				dropdown.onChange((value: string) => {
					this.plugin.settings.syncProvider = value as ProviderName;
					this.plugin.saveSettings();
					this.renderCredentials();
				});
			});

		// Container for credential fields
		this.credentialContainer = containerEl.createDiv({ cls: "credential-fields" });
		this.renderCredentials();
	}

	private renderCredentials(): void {
		this.credentialContainer.empty();

		const provider = this.plugin.settings.syncProvider;
		const envVars = PROVIDER_ENVS[provider];
		const secretEnvs = envVars.filter((v) => v.isSecret);
		const restEnvs = envVars.filter((v) => !v.isSecret);

		for (const env of secretEnvs) {
			new Setting(this.credentialContainer)
				.setName(env.key + `${env.isRequired ? " *" : ""}`)
				.setDesc(env.description)
				.addComponent((el) =>
					new SecretComponent(this.app, el).setValue(this.plugin.settings.credentials[env.key] || "").onChange(async (val: string) => {
						this.plugin.settings.credentials[env.key] = val;
						await this.plugin.saveSettings();
					}),
				);
		}

		for (const env of restEnvs) {
			new Setting(this.credentialContainer)
				.setName(env.key + `${env.isRequired ? " *" : ""}`)
				.setDesc(env.description)
				.addText((text) => {
					text.setPlaceholder(`Enter ${env.key}`);
					text.setValue(this.plugin.settings.credentials[env.key] || "").onChange(async (val: string) => {
						this.plugin.settings.credentials[env.key] = val;
						await this.plugin.saveSettings();
					});
				});
		}
	}
}
