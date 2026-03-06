// Remove Whitespace, to lowercase
// Non-alphanumerics -> dashes: "Hello, World!!!" → "hello-world"

import { ipcAPI } from '@render/services/ipcAPIService';
import { useImageStore } from '@render/stores/imageStore';
import { ALLOWED_IMAGE_TYPES } from '@shared/constants.js';
import { ImageFilePayload, Values } from '@shared/types';

// Remove leading/trailing dashes: "---test---" -> "test" that might come from the first regex
export function displayNameToTechnicalName(x: string): string {
    return x
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const bitmapToBlob = async (imageBitmap: ImageBitmap, type = 'image/webp', quality = 0.5): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(imageBitmap, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (!b) reject(new Error('Blob returned is null'));
                else return resolve(b);
            },
            type,
            quality,
        );
    });
};

export const getBitmapFromURL = async (url: string): Promise<ImageBitmap> => {
    try {
        const urlPattern = /https?:\/\/[^\s]+/;
        if (!urlPattern.test(url)) throw new Error('URL Pattern test failed.');

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'image/*',
            },
        });
        if (!res.ok) throw new Error('Fetch result was not OK');

        const blob = await res.blob();
        const imageBitMap = await createImageBitmap(blob);

        return imageBitMap;
    } catch (e) {
        console.error('Bitmap could not be generated from URL', e);
        throw e;
    }
};

export const getFileBufferFromPath = async (filePath: string): Promise<Uint8Array> => {
    try {
        return await ipcAPI<Uint8Array>(() => window.utils.createBufferFromFile(filePath));
    } catch (err) {
        console.error('Failed to get file buffer from path:', filePath, err);
        throw err;
    }
};

export const createBufferHash = async (buffer: Uint8Array): Promise<string> => {
    try {
        return await ipcAPI<string>(() => window.utils.createBufferHash(buffer));
    } catch (error) {
        console.error('Failed to create buffer hash:', error);
        throw error;
    }
};

export const openFileExplorerForImageUpload = async (cb: Function): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.values(ALLOWED_IMAGE_TYPES).join(',');
    input.multiple = true;
    input.onchange = async (e: any) => {
        await cb(e.target.files);
    };
    input.click();
};

export const uploadFileList = async (fileList: FileList): Promise<void> => {
    const imageStore = useImageStore();
    for (const file of fileList) {
        if ((Object.values(ALLOWED_IMAGE_TYPES) as string[]).includes(file.type)) {
            const imageFile: ImageFilePayload = {
                name: file.name,
                mimeType: file.type as Values<typeof ALLOWED_IMAGE_TYPES>,
                size: file.size,
                data: new Uint8Array(await file.arrayBuffer()),
                hash: await createBufferHash(new Uint8Array(await file.arrayBuffer())),
            };
            try {
                await imageStore.createImage(file.name, imageFile);
            } catch (error) {
                console.error('Error persisting selected image file:', error);
            }
        } else {
            console.warn(`File ${file.name} has unsupported type ${file.type}. Skipping.`);
        }
    }
};
