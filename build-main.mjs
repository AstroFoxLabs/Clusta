import { build } from 'esbuild';

await build({
    entryPoints: ['src/main/main.ts'],
    outfile: 'dist/main/main.js',
    target: 'esnext',
    platform: 'node',
    format: 'cjs',
    bundle: true,
    external: ['electron', 'fs', 'path', 'os', 'child_process', 'sharp', 'sqlite3', 'better-sqlite3', 'vue', 'vue-router', 'vuex', 'pinia', 'axios', 'dayjs', 'lodash', 'uuid'],
    sourcemap: false,
    minify: true,
});
