import { Plugin, TFile, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, TracerySettings, GrammarFolderLocation } from "./settings";
import { parseDataFromFolder } from "./data-handlers/data-validator";

export default class TraceryForObsidian extends Plugin {
    settings: TracerySettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new GrammarFolderLocation(this.app, this));
    }

    onunload() { }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}