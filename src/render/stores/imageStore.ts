import { ref } from 'vue';
import { defineStore } from 'pinia';
import { CatalogImage, ImageFilePayload, IpcResponse } from '@shared/types';
import { ipcAPI } from '@render/services/ipcAPIService';

export const useImageStore = defineStore('image', () => {
    /* ---------------------------- STORES ---------------------------- */

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogImage[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNAL ------------------------- */

    const upsert = (images: CatalogImage[]): void => {
        images.forEach((image) => {
            const index = collection.value.findIndex((i) => i.id == image.id);
            if (index === -1) {
                collection.value.push(image);
            } else {
                Object.assign(collection.value[index], image);
            }
        });
    };

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogImage[]> => {
        try {
            return await ipcAPI<CatalogImage[]>(() => window.catalogImage.all());
        } catch (error) {
            console.error('Failed to fetch all images:', error);
            return [];
        }
    };

    const fetchById = async (id: string): Promise<CatalogImage | null> => {
        try {
            return await ipcAPI<CatalogImage>(() => window.catalogImage.get(id));
        } catch (error) {
            console.error(`Failed to fetch image with id ${id}:`, error);
            return null;
        }
    };

    const createImage = async (
        name: string,
        payload: ImageFilePayload,
    ): Promise<{ record: CatalogImage; payload: ImageFilePayload }> => {
        const createRecord = async (name: string, hash: string): Promise<CatalogImage> => {
            try {
                return await ipcAPI<CatalogImage>(() => window.catalogImage.create(name, hash));
            } catch (error) {
                console.error('Failed to create image record:', error);
                throw error;
            }
        };

        const persistFile = async (payload: ImageFilePayload, imageID: string): Promise<ImageFilePayload> => {
            try {
                return await ipcAPI<ImageFilePayload>(() => window.catalogImage.persistFile(payload));
            } catch (error) {
                console.error('Failed to store image file:', error);
                console.warn('Deleting created record. Error, that file is not existing is normal.');
                await deleteImage(imageID);
                throw error;
            }
        };

        try {
            const record = await createRecord(name, payload.hash);
            const iPayload = await persistFile(payload, record.id);
            upsert([record]);
            return { record, payload: iPayload };
        } catch (error) {
            console.error('Image could not be created.', error);
            throw error;
        }
    };

    const updateName = async (id: string, newName: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogImage.updateName(id, newName));
            const image = collection.value.find((i) => i.id === id);
            if (image) {
                image.name = newName;
            } else {
                throw new Error('Name update was successful but image was not found in local store to update name');
            }
        } catch (error) {
            console.error(`Failed to update name for image with id ${id}:`, error);
            throw error;
        }
    };

    const updateFavorite = async (id: string, isFavorite: boolean): Promise<boolean> => {
        try {
            await ipcAPI<void>(() => window.catalogImage.updateFavorite(id, isFavorite));
            const image = collection.value.find((i) => i.id === id);
            if (image) {
                image.is_favorite = isFavorite;
            } else {
                throw new Error(
                    'Favorite update was successful but image was not found in local store to update favorite status',
                );
            }
        } catch (error) {
            console.error(`Failed to update favorite status for image with id ${id}:`, error);
            throw error;
        }
        return isFavorite;
    };

    const deleteImage = async (id: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogImage.delete(id, true));
            collection.value = collection.value.filter((i) => i.id !== id);
        } catch (error) {
            console.error(`Failed to delete image with id ${id}:`, error);
            throw error;
        }
    };

    return {
        collection,
        fetchAll,
        fetchById,
        deleteImage,
        upsert,
        updateName,
        updateFavorite,
        createImage,
    };
});
