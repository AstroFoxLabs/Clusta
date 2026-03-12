import { ipcAPI } from '@render/services/ipcAPIService';
import { upsert } from '@render/utils';
import { CatalogImage, ImageFilePayload } from '@shared/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotificationStore } from './notificationStore';

export const useImageStore = defineStore('image', () => {
    /* ---------------------------- STORES ---------------------------- */

    const notificationStore = useNotificationStore();

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogImage[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNAL ------------------------- */

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogImage[]> => {
        try {
            const res = await ipcAPI<CatalogImage[]>(() => window.catalogImage.all());
            return upsert([...res], collection.value) as CatalogImage[];
        } catch (error) {
            notificationStore.addEventMessage('Failed to fetch images');
            console.error('Error fetching images:', error);
            throw error;
        }
    };

    const create = async (name: string, payload: ImageFilePayload): Promise<CatalogImage> => {
        const createRecord = async (name: string, hash: string): Promise<CatalogImage> => {
            const id = await ipcAPI<string>(() => window.catalogImage.create(name, hash));
            return await ipcAPI<CatalogImage>(() => window.catalogImage.get(id));
        };

        const persistFile = async (payload: ImageFilePayload, imageID: string): Promise<void> => {
            try {
                await ipcAPI<ImageFilePayload>(() => window.catalogImage.persistFile(payload));
            } catch (error) {
                await deleteImage(imageID, true);
                console.error('Error persisting image file:', error);
                throw error;
            }
        };

        try {
            const record = await createRecord(name, payload.hash);
            await persistFile(payload, record.id);
            return upsert([record], collection.value) as CatalogImage;
        } catch (error) {
            notificationStore.addEventMessage('Failed to create image');
            console.error('Error creating image:', error);
            throw error;
        }
    };

    const update = async (image: CatalogImage): Promise<CatalogImage> => {
        try {
            await ipcAPI<CatalogImage>(() => window.catalogImage.update(JSON.parse(JSON.stringify(image))));
            const updatedImage = await ipcAPI<CatalogImage>(() => window.catalogImage.get(image.id));
            return upsert([updatedImage], collection.value) as CatalogImage;
        } catch (error) {
            notificationStore.addEventMessage('Failed to update image');
            console.error('Error updating image:', error);
            throw error;
        }
    };

    const deleteImage = async (id: string, onlyRecord: boolean = false): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogImage.delete(id, onlyRecord));
            collection.value = collection.value.filter((i) => i.id !== id);
        } catch (error) {
            notificationStore.addEventMessage('Failed to delete image');
            console.error('Error deleting image:', error);
            throw error;
        }
    };

    return {
        collection,
        fetchAll,
        deleteImage,
        upsert,
        update,
        create,
    };
});
