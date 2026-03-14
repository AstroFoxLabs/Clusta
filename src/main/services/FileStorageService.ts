import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import LogService from './LogService.js';
import SettingsService from './SettingsService.js';

export default class FileStorageService {
    static store(data: Uint8Array, filePath: string = ''): void {
        try {
            fs.writeFileSync(filePath, data);
        } catch (err) {
            LogService.error(`Failed to write file at ${filePath}:`, err);
            throw err;
        }
    }

    static getFileAsJSON(filePath: string): Record<string, any> {
        try {
            const file = fs.readFileSync(filePath);
            return JSON.parse(file.toString());
        } catch (err) {
            LogService.error(`Failed to read or parse JSON file at ${filePath}:`, err);
            throw err;
        }
    }

    static copyDir(sourcePath: string, destinationPath: string): void {
        try {
            const src = path.join(sourcePath);
            const dest = path.join(destinationPath);
            fs.cpSync(src, dest, { recursive: true });
        } catch (err) {
            LogService.error(`Failed to copy directory from ${sourcePath} to ${destinationPath}:`, err);
            throw err;
        }
    }

    static getFileNames(
        dirPath: string = '',
        basePath: string = SettingsService.getInstance().getSettings().paths.userData,
    ): string[] {
        const fullPath = path.join(basePath, dirPath);
        try {
            return fs.readdirSync(fullPath);
        } catch (err) {
            LogService.error(`Could not get file names of directory ${fullPath}. Returning empty array:`, err);
            return [];
        }
    }

    static createDir(dirPath: string = ''): void {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            } else {
                LogService.warn(`Directory ${dirPath} already exists. Skipping creation.`);
            }
        } catch (err) {
            LogService.error(`Failed to create directory ${dirPath}:`, err);
            throw err;
        }
    }

    static delete(filePath: string): void {
        try {
            if (!fs.existsSync(filePath)) throw new Error(`File ${filePath} does not exist.`);
            fs.unlinkSync(filePath);
        } catch (err) {
            LogService.error(`Failed to delete file at ${filePath}:`, err);
            throw err;
        }
    }

    static createHash(buffer: Buffer, inputBytes: number = 4096, outputLength: number = 16): string {
        try {
            if (!buffer || buffer.length === 0) {
                throw new Error('Buffer is empty or undefined');
            }
            const hash = crypto
                .createHash('sha256')
                .update(buffer.subarray(0, inputBytes))
                .digest('hex')
                .slice(0, outputLength);
            return hash;
        } catch (err) {
            LogService.error('Failed to create hash from buffer:', err);
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
            LogService.error(`Failed to read file at ${filePath}:`, err);
            throw err;
        }
    }
}
