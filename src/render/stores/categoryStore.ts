import { ipcAPI } from '@render/services/ipcAPIService';
import { displayNameToTechnicalName, upsert } from '@render/utils';
import { CatalogCategory } from '@shared/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useImageStore } from './imageStore';
import { useNotificationStore } from './notificationStore';

export const useCategoryStore = defineStore('category', () => {
    /* ---------------------------- STORES ---------------------------- */

    const imageStore = useImageStore();
    const notificationStore = useNotificationStore();

    /* ---------------------------- STATES ---------------------------- */

    const collection = ref<CatalogCategory[]>([]);
    const selectedCategoryId = ref<string>('all');

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const setSelectedCategoryId = (id: string): void => {
        if (collection.value.map((c) => c.id).includes(id) || id === 'all' || id === 'uncategorized') {
            selectedCategoryId.value = id;
        } else {
            throw new Error(`Category with id ${id} does not exist in the store`);
        }
    };

    /* ----------------------------- ACTIONS ------------------------- */

    const fetchAll = async (): Promise<CatalogCategory[]> => {
        try {
            const res = await ipcAPI<CatalogCategory[]>(() => window.catalogCategory.all());
            return upsert([...res], collection.value) as CatalogCategory[];
        } catch (err) {
            notificationStore.addEventMessage('Failed to fetch categories');
            throw err;
        }
    };

    const create = async (displayName: string): Promise<CatalogCategory> => {
        try {
            const id = await ipcAPI<string>(() =>
                window.catalogCategory.create(displayName, displayNameToTechnicalName(displayName)),
            );
            const newCategory = await ipcAPI<CatalogCategory>(() => window.catalogCategory.get(id));
            upsert([newCategory], collection.value);
            return newCategory;
        } catch (err) {
            notificationStore.addEventMessage('Failed to create category');
            console.error('Error creating category:', err);
            throw err;
        }
    };

    const assignToImage = async (imageId: string, categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.assignToImage(imageId, categoryId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            const category = collection.value.find((cat) => cat.id === categoryId);
            if (image && category) {
                image.categories = [...(image.categories ?? []), category];
            }
        } catch (err) {
            notificationStore.addEventMessage('Failed to assign category to image');
            console.error('Error assigning category to image:', err);
            throw err;
        }
    };

    const unassignFromImage = async (imageId: string, categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.unassignFromImage(imageId, categoryId));
            const image = imageStore.collection.find((img) => img.id === imageId);
            if (image) {
                image.categories = image.categories?.filter((c) => c.id !== categoryId);
            }
        } catch (err) {
            notificationStore.addEventMessage('Failed to unassign category from image');
            console.error('Error unassigning category from image:', err);
            throw err;
        }
    };

    const deleteRecord = async (categoryId: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.catalogCategory.delete(categoryId));
            collection.value = collection.value.filter((c) => c.id !== categoryId);
        } catch (err) {
            notificationStore.addEventMessage('Failed to delete category');
            console.error('Error deleting category:', err);
            throw err;
        }
    };

    const update = async (category: CatalogCategory): Promise<CatalogCategory> => {
        try {
            await ipcAPI<CatalogCategory>(() => window.catalogCategory.update(JSON.parse(JSON.stringify(category))));
            const updatedCategory = await ipcAPI<CatalogCategory>(() => window.catalogCategory.get(category.id));
            return upsert([updatedCategory], collection.value) as CatalogCategory;
        } catch (err) {
            notificationStore.addEventMessage('Failed to update category');
            console.error('Error updating category:', err);
            throw err;
        }
    };

    return {
        collection,
        selectedCategoryId,
        upsert,
        fetchAll,
        create,
        update,
        assignToImage,
        unassignFromImage,
        setSelectedCategoryId,
        deleteRecord,
    };
});
