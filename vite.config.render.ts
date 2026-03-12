import vue from '@vitejs/plugin-vue';
import path from 'path';
import url from 'url';
import { defineConfig } from 'vite';

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)));

export default defineConfig({
    plugins: [vue()],
    base: './',
    root: path.resolve(projectRoot, 'src/render'),
    resolve: {
        alias: {
            '@': path.resolve(projectRoot, 'src/render'),
            '@shared': path.resolve(projectRoot, 'src/shared'),
            '@render': path.resolve(projectRoot, 'src/render'),
            '@assets': path.resolve(projectRoot, 'src/render/public/assets'),
        },
    },
    //esbuild options for production build
    build: {
        outDir: path.resolve(projectRoot, 'dist/render'),
        emptyOutDir: true,
        assetsDir: 'assets',
        rollupOptions: {
            input: path.resolve(projectRoot, 'src/render/index.html'),
        },
        sourcemap: false,
        minify: 'esbuild',
        target: 'esnext',
    },

    define: {
        'process.env.IS_PREACT': 'true',
    },
});
