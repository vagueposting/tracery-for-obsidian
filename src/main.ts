import { Plugin, TFile, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, TracerySettings, GrammarFolderLocation } from "./settings";
import { parseDataFromFolder } from "./data-handlers/data-validator";

export default class TraceryForObsidian extends Plugin {
    settings: TracerySettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new GrammarFolderLocation(this.app, this));

        this.addCommand({ // TODO: I'll probably have to remove/alter this
            // since I allow both YAML and JSON
            id: 'check-yaml-block',
            name: 'Check YAML block in current file',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    if (!checking) {
                        this.runDataCheck(activeFile);
                    }
                    return true;
                }
                return false;
            }
        });
    }

    async runDataCheck(file: TFile) {
        const data = await parseDataFromFolder(this.app, this.settings.grammarPath);
        if (data) {
            console.log("Found YAML data:", data);
            new Notice("YAML block parsed successfully!");
        } else {
            new Notice("No valid YAML block found.");
        }
    }

    onunload() { }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}