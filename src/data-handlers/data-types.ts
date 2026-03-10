import { TFile } from 'obsidian';

export enum DataFormats { 
    JSON = 'json', 
    YAML = 'yaml'
};

/* Grammar processing steps */

export interface UnprocessedGrammar {
    name: string;
    data: TFile;
}

export interface HalfProcess {
    name: string;
    originalType: DataFormats;
    data: string;
}

export interface ValidGrammar {
    name: string;
    originalType: DataFormats;
    data: Record<string, string | string[]>;
}