import { ipcAPI } from '@render/services/ipcAPIService';
import { displayNameToTechnicalName, upsert } from '@render/utils';
import { CatalogTag } from '@shared/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useImageStore } from './imageStore';
import { useNotificationStore } from './notificationStore';

export const useTagStore = defineStore('tag', () => {
    /* ---------------------------- STORES ---------------------------- */

    const imageStore = useImageStore();
    const notificationStore = useNotificationStore();

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogTag[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogTag[]> => {
        try {
            const res = await ipcAPI<CatalogTag[]>(() => window.catalogTag.all());
            return upsert([...res], collection.value) as CatalogTag[];
        } catch (err) {
            notificationStore.addEventMessage('Failed to fetch tags');
            console.error('Error fetching tags:', err);
            throw err;
        }
    };

    const create = async (name: string): Promise<CatalogTag> => {
        try {
            const technicalName = displayNameToTechnicalName(name);
            const id = await ipcAPI<string>(() => window.catalogTag.create(technicalName));
            const tag = await ipcAPI<CatalogTag>(() => window.catalogTag.get(id));
            return upsert([tag], collection.value) as CatalogTag;
        } catch (err) {
            notificationStore.addEventMessage('Failed to create tag');
            console.error('Error creating tag:', err);
            throw err;
        }
    };

    const assignToImage = async (imageId: string, tagId: string): Promise<void> => {
        try {
            const image = imageStore.collection.find((img) => img.id === imageId);
            const tag = collection.value.find((t) => t.id === tagId);

            if (!image) {
                throw new Error(`Image with id ${imageId} not found`);
            } else if (!tag) {
                throw new Error(`Tag with id ${tagId} not found`);
            } else if (image.tags?.map((t) => t.id).includes(tagId)) {
                throw new Error(`Tag with id ${tagId} is already assigned to image with id ${imageId}`);
            }

            await ipcAPI<void>(() => window.catalogTag.assignToImage(imageId, tagId));
            image.tags = [...(image.tags ?? []), tag];
        } catch (err) {
            notificationStore.addEventMessage('Failed to assign tag to image');
            console.error('Error assigning tag to image:', err);
            throw err;
        }
    };

    const unassignFromImage = async (imageId: string, tagId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogTag.unassignFromImage(imageId, tagId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            if (!image) {
                throw new Error(`Image with id ${imageId} not found`);
            }
            image.tags = image.tags?.filter((t) => t.id !== tagId) ?? [];
        } catch (err) {
            notificationStore.addEventMessage('Failed to unassign tag from image');
            console.error('Error unassigning tag from image:', err);
            throw err;
        }
    };

    const deleteRecord = async (tagId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogTag.delete(tagId));
            collection.value = collection.value.filter((t) => t.id !== tagId);
        } catch (err) {
            notificationStore.addEventMessage('Failed to delete tag');
            console.error('Error deleting tag:', err);
            throw err;
        }
    };

    return {
        collection,
        upsert,
        fetchAll,
        create,
        unassignFromImage,
        assignToImage,
        deleteRecord,
    };
});
