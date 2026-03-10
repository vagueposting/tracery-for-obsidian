import { App, TAbstractFile, TFile, TFolder, Vault, parseYaml, SectionCache } from 'obsidian';
import { DataFormats } from './data-types';

interface HalfProcess {
    name: string;
    data: TFile;
}

interface CleanGrammar {
    name: string;
    originalType: DataFormats;
    data: string;
}

async function scanGrammarFolder(vault: Vault, path: string): Promise<HalfProcess[] | null> {
    if (!path) return null;
    
    const folder = vault.getFolderByPath(path);
    if (!folder?.children) return null;
    
    // Filter first, then map
    return folder.children
        .filter((file): file is TFile => file instanceof TFile)
        .map(file => ({
            name: file.name,
            data: file
        }));
}

async function getGrammarData(app: App, file: HalfProcess): Promise<CleanGrammar | null> {
    const cache = app.metadataCache.getFileCache(file.data);

    if (!cache || !cache.sections) return null;

    const codeSection = cache.sections.find(
        (sec: SectionCache) => sec.type === 'code');

    if (codeSection) {
        const content = await app.vault.read(file.data);

        const block = content.slice(
            codeSection.position.start.offset,
            codeSection.position.end.offset
        )

        const cleanedGrammar = {
            name: file.name,
            originalType: block.startsWith('```yaml') ? DataFormats.YAML : DataFormats.JSON,
            data: ''
        };

        if (block.startsWith('```yaml') || block.startsWith('```json')) {
            cleanedGrammar.data = block.split('\n').slice(1, -1).join('\n');
            return cleanedGrammar
        }
    }

    return null;
}

export async function parseDataFromFolder(app: App, path: string): Promise<object[]> { 
    // steps:
    // scanGrammarFolder()
    const grammarFiles = await scanGrammarFolder(app.vault, path)
    if (!grammarFiles) return [];

    // iterate through folder with getGrammarData()
    const grammarObjects = await Promise.all(
        grammarFiles.map(async (file) => {
            const content = await getGrammarData(app, file);

            if (!content) return null;

        // parse JSON *or* turn YAML into JSON
            try {
                // Check for JSON first.
                return JSON.parse(content.data);
            } catch {
                // YAML fallback.
                return parseYaml(content.data);
            }
        })
    );
    // return array of valid grammar objects - all in JSON :)

    return grammarObjects.filter(result => result !== null);
};