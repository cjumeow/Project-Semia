import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const baseOptions = {
  bundle: true,
  sourcemap: true,
  target: ['chrome114'],
  platform: 'browser',
  logLevel: 'info',
  loader: {
    '.css': 'text',
  },
};

const buildOptionsList = [
  {
    ...baseOptions,
    entryPoints: ['src/background.ts'],
    outfile: 'dist/background.js',
    format: 'iife',
  },
  {
    ...baseOptions,
    entryPoints: ['src/contentScript.ts'],
    outfile: 'dist/contentScript.js',
    format: 'iife',
  },
  {
    ...baseOptions,
    entryPoints: ['src/pageWorld.ts'],
    outfile: 'dist/pageWorld.js',
    format: 'iife',
  }
];


if (watch) {
  // Rebuild on changes.
  const contexts = await Promise.all(buildOptionsList.map((opt) => esbuild.context(opt)));
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log('[watch] watching...');
} else {
  await Promise.all(buildOptionsList.map((opt) => esbuild.build(opt)));
}
