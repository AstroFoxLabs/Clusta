import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [vue()],

    base: './',
    root: path.resolve(__dirname),
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
            '@shared': path.resolve(__dirname, '..', 'shared'),
            '@render': path.resolve(__dirname),
        },
    },
    build: {
        // write output to project-root/dist/render
        outDir: path.resolve(__dirname, '../../dist/render'),
        emptyOutDir: true,
        assetsDir: 'assets',
        rollupOptions: {
            input: path.resolve(__dirname, 'index.html'),
        },
        sourcemap: false,
        minify: 'esbuild',
    },

    // env
    define: {
        'process.env.IS_PREACT': 'true',
    },
});
