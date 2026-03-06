import { register } from './ipcHandlers.js';
import FileStorageService from '../services/FileStorageService.js';

register<{ buffer: Uint8Array }, string>('create-buffer-hash', async (event, { buffer }) => {
    return FileStorageService.createHash(Buffer.from(buffer));
});

register<{ filePath: string }, Uint8Array>('create-buffer-from-file', async (event, { filePath }) => {
    const buffer = await FileStorageService.getFileBuffer(filePath);
    return new Uint8Array(buffer);
});
