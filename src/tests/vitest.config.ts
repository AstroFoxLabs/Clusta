import path from 'path';
import url from 'url';
import { defineConfig } from 'vitest/config';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig({
    test: {
        environment: 'node',
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, 'src'),
            '@shared': path.resolve(dirname, 'src/shared'),
            '@render': path.resolve(dirname, 'src/render'),
            '@assets': path.resolve(dirname, 'src/render/public/assets'),
        },
    },
});
