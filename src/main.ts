import { Plugin, MarkdownView, TFile, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";
import { parseYAMLFromBlock } from "./data-handlers/YAML-parser";

export default class TraceryForObsidian extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new SampleSettingTab(this.app, this));

        this.addCommand({
            id: 'check-yaml-block',
            name: 'Check YAML block in current file',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    if (!checking) {
                        this.runYamlCheck(activeFile);
                    }
                    return true;
                }
                return false;
            }
        });
    }

    async runYamlCheck(file: TFile) {
        const data = await parseYAMLFromBlock(this.app, file);
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