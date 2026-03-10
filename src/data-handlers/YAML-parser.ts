import { App, TFile, parseYaml, SectionCache } from 'obsidian';

async function getYAMLBlock(app: App, file: TFile): Promise<string | null> {
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

        if (block.startsWith('```yaml')) {
            return block.split('\n').slice(1, -1).join('\n');
        }
    }

    return null;
}

export async function parseYAMLFromBlock(app: App, file: TFile): Promise<any | null> {
    try {
        const yamlObj = await getYAMLBlock(app, file);

        if (yamlObj) {
            return parseYaml(yamlObj);
        }
    } catch (e) {
        console.error('Failed to parse YAML block:', e);
    }

    return null;
};