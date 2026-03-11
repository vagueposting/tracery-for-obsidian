import {App, PluginSettingTab, Setting} from "obsidian";
import TraceryForObsidian from "../main";
import { FolderSuggest } from './suggesters/FolderSuggester';

export interface TracerySettings {
	grammarPath: string;
	updateNotifs: boolean;
}

export const DEFAULT_SETTINGS: TracerySettings = {
	grammarPath: '',
	updateNotifs: true
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
				cb.containerEl.addClass('tracery');
			});

			
        new Setting(this.containerEl)
            .setName('Notify on update')
            .setDesc('Disable this if you find notifications while editing annoying')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.updateNotifs)
                    .onChange((updateNotifs) => {
                        this.plugin.settings.updateNotifs =
                            updateNotifs;
                        this.plugin.saveSettings();
                    });
            });
}}