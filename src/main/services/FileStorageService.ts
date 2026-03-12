import fs from 'fs';
import path from 'path';
import LogService from './LogService.js';
import SettingsService from './SettingsService.js';
import crypto from 'crypto';

export default class FileStorageService {
    static store(fileName: string, dataBuffer: Buffer, additionalPath: string = ''): string {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.root, additionalPath, fileName);
        fs.writeFileSync(fullPath, dataBuffer);
        return fullPath;
    }

    static getFileAsJSON(additionalPath: string = '', fileName: string): Record<string, any> {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.root, additionalPath, fileName);

        const file = fs.readFileSync(fullPath);
        return JSON.parse(file.toString());
    }

    // returns array of file names (not full paths) stored on disk
    static getNames(additionalPath: string = ''): string[] {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.root, additionalPath);
        try {
            return fs.readdirSync(fullPath);
        } catch (err) {
            LogService.error(`Could not get file names of directory ${fullPath}. Returning empty array:`, err);
            return [];
        }
    }

    static createDir(additionalPath: string = ''): void {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.root, additionalPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        } else {
            LogService.warn(`Directory ${fullPath} already exists. Skipping creation.`);
        }
    }

    static delete(fileName: string, additionalPath: string = ''): void {
        const fullPath = path.join(SettingsService.getInstance().getSettings().paths.root, additionalPath, fileName);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        } else {
            throw new Error(`File ${fullPath} does not exist.`);
        }
    }

    static createHash(buffer: Buffer, inputBytes: number = 4096, outputLength: number = 16): string {
        if (!buffer || buffer.length === 0) {
            throw new Error('Buffer is empty or undefined');
        }
        const hash = crypto
            .createHash('sha256')
            .update(buffer.subarray(0, inputBytes))
            .digest('hex')
            .slice(0, outputLength);
        return hash;
    }

    static pathExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    static async getFileBuffer(filePath: string): Promise<Buffer> {
        return await fs.promises.readFile(filePath);
    }
}
