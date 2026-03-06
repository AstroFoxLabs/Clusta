import { ref } from 'vue';
import { defineStore } from 'pinia';
import { IpcResponse, CatalogCategory } from '@shared/types';
import { useImageStore } from './../stores/imageStore';
import { displayNameToTechnicalName } from '@render/utils/utils';
import { ipcAPI } from '@render/services/ipcAPIService';

export const useCategoryStore = defineStore('category', () => {
    /* ---------------------------- STORES ---------------------------- */

    const imageStore = useImageStore();

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogCategory[]>([]);
    const selectedCategoryId = ref<string>('all');

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const upsert = (categories: CatalogCategory[]): void => {
        categories.forEach((category) => {
            const index = collection.value.findIndex((c) => c.id == category.id);
            if (index === -1) {
                collection.value.push(category);
            } else {
                Object.assign(collection.value[index], category);
            }
        });
    };

    const setSelectedCategoryId = (id: string): void => {
        if (collection.value.map((c) => c.id).includes(id) || id === 'all' || id === 'uncategorized') {
            selectedCategoryId.value = id;
        } else {
            console.error(`Attempted to set selected category ID to ${id}, but it does not exist in the store.`);
        }
    };

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogCategory[]> => {
        try {
            return await ipcAPI<CatalogCategory[]>(() => window.catalogCategory.all());
        } catch (error) {
            console.error('Failed to fetch all categories:', error);
            return [];
        }
    };

    const fetchById = async (id: string): Promise<CatalogCategory | null> => {
        try {
            return await ipcAPI<CatalogCategory>(() => window.catalogCategory.get(id));
        } catch (error) {
            console.error(`Failed to fetch category with id ${id}:`, error);
            return null;
        }
    };

    const create = async (displayName: string): Promise<string> => {
        try {
            const technicalName = displayNameToTechnicalName(displayName);
            const category = await ipcAPI<CatalogCategory>(() =>
                window.catalogCategory.create(displayName, technicalName),
            );
            upsert([category]);
            return category.id;
        } catch (error) {
            console.error('Failed to save category:', error);
            throw error;
        }
    };

    const assignToImage = async (imageId: string, categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.assignToImage(imageId, categoryId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            const category = collection.value.find((cat) => cat.id === categoryId);
            if (image && category) {
                image.categories = [...(image.categories ?? []), category];
            } else {
                throw new Error('Image or category not found in store after assigning category to image');
            }
        } catch (error) {
            console.error(`Failed to assign category ${categoryId} to image ${imageId}:`, error);
            throw error;
        }
    };

    const unassignFromImage = async (imageId: string, categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.unassignFromImage(imageId, categoryId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            if (image) {
                image.categories = image.categories?.filter((c) => c.id !== categoryId);
            } else {
                throw new Error('Image not found in store after removing category from image');
            }
        } catch (error) {
            console.error(`Failed to remove category ${categoryId} from image ${imageId}:`, error);
            throw error;
        }
    };

    const deleteRecord = async (categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.delete(categoryId));
            collection.value = collection.value.filter((c) => c.id !== categoryId);
        } catch (error) {
            console.error(`Failed to delete category with id ${categoryId}:`, error);
            throw error;
        }
    };

    const updateName = async (categoryId: string, displayName: string): Promise<void> => {
        try {
            const technicalName = displayNameToTechnicalName(displayName);
            await ipcAPI<CatalogCategory>(() =>
                window.catalogCategory.updateName(categoryId, displayName, technicalName),
            );
            const index = collection.value.findIndex((c) => c.id === categoryId);
            if (index !== -1) {
                collection.value[index].technical_name = technicalName;
                collection.value[index].display_name = displayName;
            } else {
                throw new Error('Category not found in store after updating category name');
            }
        } catch (error) {
            console.error(`Failed to update category with id ${categoryId}:`, error);
            throw error;
        }
    };

    return {
        collection,
        selectedCategoryId,
        upsert,
        fetchAll,
        fetchById,
        create,
        assignToImage,
        unassignFromImage,
        setSelectedCategoryId,
        deleteRecord,
        updateName,
    };
});
