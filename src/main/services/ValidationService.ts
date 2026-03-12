import { fileTypeFromBuffer, type FileTypeResult } from 'file-type';
import { ALLOWED_IMAGE_TYPES } from '@shared/constants.js';
import type { AllowedMimeType, ImageExtension } from '@shared/types.js';
import SettingsService from './SettingsService.js';

export default class ValidationService {
    static async isValidImageBuffer(buffer: Buffer): Promise<boolean> {
        const res: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
        if (!res) return false;
        return res.mime.startsWith('image/') && this.isAllowedImageExtension(res.ext);
    }

    static async fileSizeIsValid(buffer: Buffer): Promise<boolean> {
        const maxSizeBytes = SettingsService.getInstance().getSettings().image.maxSizeMB * 1024 * 1024;
        return buffer.byteLength <= maxSizeBytes && buffer.byteLength > 0;
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
