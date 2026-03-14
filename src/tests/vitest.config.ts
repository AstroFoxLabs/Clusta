import path from 'node:path';
import { defineConfig } from 'vitest/config';
const __dirname = path.dirname(__filename);

export default defineConfig({
    test: {
        environment: 'node',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
            '@shared': path.resolve(__dirname, '../shared'),
            '@render': path.resolve(__dirname, '../render'),
            '@assets': path.resolve(__dirname, '../render/public/assets'),
            '@main': path.resolve(__dirname, '../main'),
        },
    },
});
