import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import SettingsService from './SettingsService.js';
import { LogService } from './LogService.js';

export default class FileStorageService {
    static store(fileName: string, dataBuffer: Buffer, additionalPath: string = ''): string {
        try {
            const fullPath = path.join(
                SettingsService.getInstance().getSettings().paths.fileDefaultPath,
                additionalPath,
                fileName,
            );
            fs.writeFileSync(fullPath, dataBuffer);
            return fullPath;
        } catch (err) {
            LogService.error('FileStorageService.store failed:', err);
            throw err;
        }
    }

    static getFileAsJSON(additionalPath: string = '', fileName: string): Record<string, any> {
        const fullPath = path.join(
            SettingsService.getInstance().getSettings().paths.fileDefaultPath,
            additionalPath,
            fileName,
        );

        try {
            const file = fs.readFileSync(fullPath);
            return JSON.parse(file.toString());
        } catch (err) {
            LogService.error(`Failed to read or parse file ${fullPath}:`, err);
            throw err;
        }
    }

    // returns array of file names (not full paths) stored on disk
    static getNames(additionalPath: string = ''): string[] {
        try {
            const fullPath = path.join(
                SettingsService.getInstance().getSettings().paths.fileDefaultPath,
                additionalPath,
            );
            return fs.readdirSync(fullPath);
        } catch (err) {
            LogService.error('FileStorageService.getNames failed:', err);
            return [];
        }
    }

    static createDir(additionalPath: string = ''): void {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.fileDefaultPath, additionalPath);
        try {
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        } catch (err) {
            LogService.error('FileStorageService.createDir failed:', err);
            throw err;
        }
    }

    static delete(fileName: string, additionalPath: string = ''): void {
        try {
            const fullPath = path.join(
                SettingsService.getInstance().getSettings().paths.fileDefaultPath,
                additionalPath,
                fileName,
            );
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            } else {
                throw new Error(`File ${fullPath} does not exist.`);
            }
        } catch (err) {
            LogService.error('FileStorageService.delete failed:', err);
            throw err;
        }
    }

    static createHash(buffer: Buffer, inputBytes: number = 4096, outputLength: number = 16): string {
        if (!buffer || buffer.length === 0) {
            throw new Error('Buffer is empty or undefined');
        }
        try {
            const hash = createHash('sha256')
                .update(buffer.subarray(0, inputBytes))
                .digest('hex')
                .slice(0, outputLength);
            return hash;
        } catch (err) {
            LogService.error('FileStorageService.createHash failed:', err);
            throw err;
        }
    }

    static pathExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    static async getFileBuffer(filePath: string): Promise<Buffer> {
        try {
            return await fs.promises.readFile(filePath);
        } catch (err) {
            LogService.error('FileStorageService.getFileBuffer failed:', err);
            throw err;
        }
    }
}
