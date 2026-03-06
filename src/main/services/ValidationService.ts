import * as fs from 'fs';
import type { AllowedMimeType, ImageExtension } from '../../shared/types.js';
import { fileTypeFromBuffer, type FileTypeResult } from 'file-type';
import { ALLOWED_IMAGE_TYPES } from '../../shared/constants.js';
import SettingsService from './SettingsService.js';

export default class ValidationService {
    static async isValidImageBuffer(buffer: Buffer): Promise<boolean> {
        try {
            const res: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
            if (res && res.mime.startsWith('image/') && this.isAllowedImageExtension(res.ext)) {
                return true;
            }
        } catch (error) {
            console.error('Error validating image buffer:', error);
        }
        return false;
    }

    static async fileSizeIsValid(buffer: Buffer): Promise<boolean> {
        const maxSizeBytes = SettingsService.getInstance().getSettings().image.maxSizeMB * 1024 * 1024;
        console.log(`Validating file size: ${buffer.byteLength} bytes (max: ${maxSizeBytes} bytes)`);
        return buffer.byteLength <= maxSizeBytes && buffer.byteLength > 0;
    }

    static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    // Runtime check
    static isAllowedImageExtension(keyValue: string): keyValue is ImageExtension {
        return Object.keys(ALLOWED_IMAGE_TYPES).includes(keyValue);
    }

    // Runtime check
    static isAllowedImageMimeType(value: string): value is AllowedMimeType {
        return (Object.values(ALLOWED_IMAGE_TYPES) as readonly string[]).includes(value);
    }
}
