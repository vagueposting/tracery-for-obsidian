import { Plugin, TFile, Notice, CachedMetadata } from 'obsidian';
import { DEFAULT_SETTINGS, TracerySettings, GrammarFolderLocation } from "./settings";
import { parseDataFromFolder } from "./data-handlers/data-validator";

export default class TraceryForObsidian extends Plugin {
    settings: TracerySettings;
    cachedGrammars: Map<string, object> = new Map();
    grammarFolderPath: string = '';

    async onload() {
        await this.loadSettings();
        this.grammarFolderPath = this.settings.grammarPath;

        this.addSettingTab(new GrammarFolderLocation(this.app, this));

        this.registerEvent(
            this.app.vault.on('modify', async (file: TFile) => {
                await this.handleGrammarFileChange(file);
            })
        );

        this.registerEvent(
            this.app.vault.on('create', async (file: TFile) => {
                await this.handleGrammarFileChange(file);
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', async (file) => {
                if (file.path.startsWith(this.grammarFolderPath)) {
                    this.cachedGrammars.delete(file.path);
                    await this.reloadAllGrammars();
                }
            })
        );

        this.addCommand({
            id: 'reload-grammars',
            name: 'Reload all grammars in folder',
            callback: async () => {
                await this.reloadAllGrammars();
                new Notice('Grammars reloaded!');
            }
        })

        await this.reloadAllGrammars();
    }
 
    async handleGrammarFileChange(file: TFile) {
        if (file.path.startsWith(this.grammarFolderPath)
            && file instanceof TFile) {
            console.log(`Grammar file changed: %{file.path}`);

            const grammars = await parseDataFromFolder(this.app, this.grammarFolderPath);

            this.cachedGrammars.clear();

            grammars.forEach((g) => {
                this.cachedGrammars.set(g.name, g.data)
            });

            new Notice(`Grammar updated: ${file.name}`);
        }
    }

    async reloadAllGrammars() {
        const grammars = await parseDataFromFolder(this.app, this.grammarFolderPath);
        this.cachedGrammars.clear();
        grammars.forEach((g) => {
            this.cachedGrammars.set(g.name, g.data)
        });

        console.log(`Loaded ${grammars.length} grammars.`)
    }

    getGrammar(key: string): object | undefined {
        return this.cachedGrammars.get(key);
    };

    async saveSettings() {
        await this.saveData(this.settings);
        
        if (this.grammarFolderPath !== this.settings.grammarPath) {
            this.grammarFolderPath = this.settings.grammarPath;
            await this.reloadAllGrammars();
        }
    }

    onunload() { }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
}