// Must be in a normal *.ts file because d.ts are compilation only
export const ALLOWED_IMAGE_TYPES = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    svg: 'image/svg+xml',
} as const;
