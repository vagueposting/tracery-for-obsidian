import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

export interface TracerySettings {
	grammarPath: string;
}

export const DEFAULT_SETTINGS: TracerySettings = {
	grammarPath: ''
}

export class GrammarFolderLocation extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Grammar Folder')
			.setDesc('Path leading to your grammar folder')
			.addText(text => text
				.setPlaceholder('Enter path')
				.setValue(this.plugin.settings.grammarPath)
				.onChange(async (value) => {
					this.plugin.settings.grammarPath = value;
					await this.plugin.saveSettings();
				}));
	}
}