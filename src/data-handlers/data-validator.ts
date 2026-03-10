import { App, TFile, Vault, parseYaml, SectionCache } from 'obsidian';
import { DataFormats, UnprocessedGrammar, HalfProcess, ValidGrammar } from './data-types'; 

async function scanGrammarFolder(vault: Vault, path: string): Promise<UnprocessedGrammar[] | null> {
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

async function getGrammarData(app: App, file: UnprocessedGrammar): Promise<HalfProcess | null> {
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

export async function parseDataFromFolder(app: App, path: string): Promise<ValidGrammar[]> { 
    // steps:
    // scanGrammarFolder()
    const grammarFiles = await scanGrammarFolder(app.vault, path)
    if (!grammarFiles) return [];

    // iterate through folder with getGrammarData()
    const grammarObjects = await Promise.all(
        grammarFiles.map(async (file) => {
            const content = await getGrammarData(app, file);

            if (!content) return null;

            const validated: ValidGrammar = {
                name: content.name,
                originalType: content.originalType,
                data: {}
            }

        // parse JSON *or* turn YAML into JSON
            try {
                if (content.originalType === DataFormats.JSON) {
                    validated.data = JSON.parse(content.data);
                } else {
                    // YAML
                    validated.data = parseYaml(content.data);
                }
            } catch (e) {
                console.error(`Failed to parse ${content.name}:`, e);
                return null;
            }

            return validated;
        })
    );
    // return array of valid grammar objects - all in JSON :)

    return grammarObjects.filter(result => result !== null);
};