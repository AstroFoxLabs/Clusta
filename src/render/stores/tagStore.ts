import { ref } from 'vue';
import { defineStore } from 'pinia';
import { IpcResponse, CatalogTag, CatalogImage } from '@shared/types';
import { useImageStore } from './imageStore';
import { displayNameToTechnicalName } from '@render/utils/utils';
import { ipcAPI } from '@render/services/ipcAPIService';

export const useTagStore = defineStore('tag', () => {
    /* ---------------------------- STORES ---------------------------- */

    const imageStore = useImageStore();

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogTag[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const upsert = (tags: CatalogTag[]): void => {
        tags.forEach((tag) => {
            const index = collection.value.findIndex((t) => t.id == tag.id);
            if (index === -1) {
                collection.value.push(tag);
            } else {
                Object.assign(collection.value[index], tag);
            }
        });
    };

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogTag[]> => {
        try {
            return await ipcAPI<CatalogTag[]>(() => window.catalogTag.all());
        } catch (error) {
            console.error('Failed to fetch all tags:', error);
            return [];
        }
    };

    const fetchById = async (id: string): Promise<CatalogTag | null> => {
        try {
            return await ipcAPI<CatalogTag>(() => window.catalogTag.get(id));
        } catch (error) {
            console.error(`Failed to fetch tag with id ${id}:`, error);
            return null;
        }
    };

    const create = async (name: string): Promise<string> => {
        try {
            const technicalName = displayNameToTechnicalName(name);
            const tag = await ipcAPI<CatalogTag>(() => window.catalogTag.create(technicalName));
            upsert([tag]);
            return tag.id;
        } catch (error) {
            console.error('Failed to create and save tag:', error);
            throw error;
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
        } catch (error) {
            console.error(`Failed to assign tag ${tagId} to image ${imageId}:`, error);
            throw error;
        }
    };

    const unassignFromImage = async (imageId: string, tagId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogTag.unassignFromImage(imageId, tagId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            if (image) {
                image.tags = image.tags?.filter((t) => t.id !== tagId) ?? [];
            }
        } catch (error) {
            console.error(`Failed to remove tag ${tagId} from image ${imageId}:`, error);
            throw error;
        }
    };

    const deleteRecord = async (tagId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogTag.delete(tagId));
            collection.value = collection.value.filter((t) => t.id !== tagId);
        } catch (error) {
            console.error(`Failed to delete tag with id ${tagId}:`, error);
            throw error;
        }
    };

    return {
        collection,
        upsert,
        fetchAll,
        fetchById,
        create,
        unassignFromImage,
        assignToImage,
        deleteRecord,
    };
});
