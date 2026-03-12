import { build } from 'esbuild';

await build({
    entryPoints: ['src/preload/preload.ts'],
    outfile: 'dist/preload/preload.js',
    target: 'esnext',
    platform: 'node',
    format: 'cjs',
    bundle: true,
    external: ['electron', 'fs', 'path', 'os', 'child_process'],
    sourcemap: false,
    minify: true,
});
