import { cp, mkdir, rm } from 'node:fs/promises';

const source = new URL('../apps/corpus/dist/', import.meta.url);
const target = new URL('../apps/extension/dist/corpus/', import.meta.url);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log('Corpus copied to apps/extension/dist/corpus');
