import tracery from "tracery-grammar";
import { ValidGrammar, DataFormats } from '../data-handlers/data-types';
import { stringifyYaml } from 'obsidian';

export class GrammarService {
    private grammars: Map<string, ValidGrammar> = new Map();

    generateText(grammarName: string,
        rule: string = '#origin#'): string | null {
        const grammar = this.grammars.get(grammarName);

        if (!grammar) return null;

        console.log(grammar)

        return this.renderGrammar(grammar.data, rule);
    }

    // generating fresh text for live updates
    generateNewText(grammarData: ValidGrammar['data'], rule: string = '#origin#'): string | null {
        if (!grammarData) return null;

        console.log(grammarData)
    
        return this.renderGrammar(grammarData, rule);
    }

    // core rendering logic
    private renderGrammar(grammarData: Record<string, string | string[]>,
         rule: string): string {
        const grammar = tracery.createGrammar(grammarData);
        console.table(grammarData);
        grammar.addModifiers(tracery.baseEngModifiers);
        
        return grammar.flatten(rule);
    }

    // in case files change
    updateGrammars(newGrammars: ValidGrammar[]) {
        this.grammars.clear();
        newGrammars.forEach(g => this.grammars.set(g.name, g));
    }

    showRawGrammar(key: string, type: DataFormats): string | null {
        const grammar = this.grammars.get(key);

        if (!grammar) return null;

        if (type === 'json') {
            return JSON.stringify(grammar, null, 2)
        } else {
            return stringifyYaml(grammar);
        }
    }

    getGrammarNames(): string[] {
        return Array.from(this.grammars.keys());
    }
}