import { Plugin, TFile, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, TracerySettings, GrammarFolderLocation } from "./settings/settings";
import { parseDataFromFolder } from "./data-handlers/data-validator";
import { GrammarService } from './services/grammar-service';
import { DataFormats } from './data-handlers/data-types';

export default class TraceryForObsidian extends Plugin {
    settings: TracerySettings;
    grammarService: GrammarService;
    grammarFolderPath: string = '';

    async onload() {
        this.registerMarkdownCodeBlockProcessor('tracery', (source, el, ctx) => {
            // source contains the grammar name or embedded grammar
            const grammarName = source.trim();
            const grammar = this.grammarService.getGrammar(grammarName);
            
            if (grammar) {
                // Generate fresh text every time the preview updates
                const text = this.grammarService.generateNewText(grammar.data)
                el.setText(text ?? '[Error: failed to generate text]');
            } else {
                el.setText(`Grammar "${grammarName}" not found`);
            }
        });

        await this.loadSettings();
        this.grammarFolderPath = this.settings.grammarPath;

        this.grammarService = new GrammarService();

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
                    await this.reloadAllGrammars();
                }
            })
        );

        this.addCommand({
            id: 'reload-grammars',
            name: 'Reload all grammars in folder',
            callback: async () => {
                await this.reloadAllGrammars();
            }
        })

        await this.reloadAllGrammars();
    }
 
    async handleGrammarFileChange(file: TFile) {
        if (file.path.startsWith(this.grammarFolderPath)
            && file instanceof TFile) {
            setTimeout(async () => {
                await this.reloadAllGrammars();
                if (this.settings.updateNotifs) {
                    new Notice(`Grammar updated: ${file.name}`);
                }                
            })
        }
    }

    async reloadAllGrammars() {
        const grammars = await parseDataFromFolder(this.app, this.grammarFolderPath);
        
        this.grammarService.updateGrammars(grammars);

        if (this.settings.updateNotifs) {
            new Notice(`Grammars reloaded!\nVault currently has ${grammars.length} grammars.`);
        }
    }

    getGrammarJSON(key: string): string | null {
        return this.grammarService.showRawGrammar(key, DataFormats.JSON)
    };

    getGrammarYAML(key: string): string | null {
        return this.grammarService.showRawGrammar(key, DataFormats.YAML)
    }

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