import {App, PluginSettingTab, Setting} from "obsidian";
import TraceryForObsidian from "../main";
import { FolderSuggest } from './suggesters/FolderSuggester';

export interface TracerySettings {
	grammarPath: string;
}

export const DEFAULT_SETTINGS: TracerySettings = {
	grammarPath: ''
}

export class GrammarFolderLocation extends PluginSettingTab {
	plugin: TraceryForObsidian;

	constructor(app: App, plugin: TraceryForObsidian) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(this.containerEl)
			.setName('Grammar Folder')
			.setDesc('Path leading to your grammar folder')
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder 2")
					.setValue(this.plugin.settings.grammarPath)
					.onChange((newFolder) => {
						newFolder = newFolder.trim();
						newFolder = newFolder.replace(/\/$/, '');

						this.plugin.settings.grammarPath = newFolder;
						this.plugin.saveSettings();
					});

				// @ts-ignore
				cb.containerEl.addClass('tracerySearch');
			})
	}
}