import { ALLOWED_IMAGE_TYPES } from '@shared/constants.js';
import sharp, { FormatEnum } from 'sharp';
import SettingsService from './SettingsService.js';

export interface ImageConversionOptions {
    quality: number;
    lossless: boolean;
    format: keyof typeof ALLOWED_IMAGE_TYPES;
    animated: boolean;
}
export default class ImageConversionService {
    buffer: Buffer;
    quality: number;
    lossless: boolean;
    format: keyof typeof ALLOWED_IMAGE_TYPES;
    animated: boolean;
    info: sharp.OutputInfo | null = null;

    constructor(
        imageBuffer: Buffer,
        options: ImageConversionOptions = {
            quality: SettingsService.getInstance().getSettings().image.conversion.quality,
            lossless: SettingsService.getInstance().getSettings().image.conversion.lossless,
            animated: SettingsService.getInstance().getSettings().image.conversion.animated,
            format: SettingsService.getInstance().getSettings().image.conversion.format,
        },
    ) {
        this.buffer = imageBuffer;
        this.quality = options.quality;
        this.lossless = options.lossless;

        this.animated = options.animated;
        this.format = options.format;
    }

    async toWebP(): Promise<Buffer> {
        const { data, info } = await sharp(this.buffer, {
            animated: this.animated,
        })
            .webp({
                lossless: this.lossless,
                quality: this.quality,
            })
            // Possibly unsafe cast
            .toFormat(this.format as unknown as keyof FormatEnum)
            .toBuffer({ resolveWithObject: true });
        this.buffer = data;
        this.info = info;
        return this.buffer;
    }
}
