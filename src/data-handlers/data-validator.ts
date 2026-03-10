import { App, TAbstractFile, TFile, TFolder, Vault, parseYaml, SectionCache } from 'obsidian';

async function scanGrammarFolder(vault: Vault, path: string): Promise<TAbstractFile[] | undefined | null> {
    if (path) {
        return vault.getFolderByPath(path)?.children;
    }

    return null
}

function removeFolders(folderContents: TAbstractFile[]): TFile[] {
    return folderContents.filter((file): file is TFile =>
        !(file instanceof TFolder))
}

async function getGrammarData(app: App, file: TFile): Promise<string | null> {
    const cache = app.metadataCache.getFileCache(file);

    if (!cache || !cache.sections) return null;

    const codeSection = cache.sections.find(
        (sec: SectionCache) => sec.type === 'code');

    if (codeSection) {
        const content = await app.vault.read(file);

        const block = content.slice(
            codeSection.position.start.offset,
            codeSection.position.end.offset
        )

        if (block.startsWith('```yaml') || block.startsWith('```json')) {
            return block.split('\n').slice(1, -1).join('\n');
        }
    }

    return null;
}

export async function parseDataFromFolder(app: App, path: string): Promise<object[]> { 
    // steps:
    // scanGrammarFolder() then filter
    const folderContents = await scanGrammarFolder(app.vault, path)
    if (!folderContents) return [];

    const grammarFiles = removeFolders(folderContents);

    // iterate through folder with getGrammarData()
    const grammarObjects = await Promise.all(
        grammarFiles.map(async (file) => {
            const content = await getGrammarData(app, file);

            if (!content) return null;

        // parse JSON *or* turn YAML into JSON
            try {
                // Check for JSON first.
                return JSON.parse(content);
            } catch {
                // YAML fallback.
                return parseYaml(content);
            }
        })
    );
    // return array of valid grammar objects - all in JSON :)

    return grammarObjects.filter(result => result !== null);
};