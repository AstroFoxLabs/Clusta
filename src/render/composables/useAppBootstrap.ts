import { useExcalidrawStore } from '@render/stores/excalidrawStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { getFileBufferFromPath } from '@render/utils/utils';
import { ImageFilePayload } from '@shared/types';
import { useCategoryStore } from '../stores/categoryStore';
import { useImageStore } from '../stores/imageStore';
import { useTagStore } from '../stores/tagStore';

// Closure to make sure the stores are available before the application is fully loaded
export const useAppBootstrap = async () => {
    const imageStore = useImageStore();
    const categoryStore = useCategoryStore();
    const tagStore = useTagStore();
    const excalidrawStore = useExcalidrawStore();
    const settingsStore = useSettingsStore();

    const initializeApp = async (): Promise<void> => {
        try {
            await settingsStore.loadSettings();
            imageStore.collection = await imageStore.fetchAll();
            categoryStore.collection = await categoryStore.fetchAll();
            tagStore.collection = await tagStore.fetchAll();
            excalidrawStore.scenes = await excalidrawStore.fetchAllRecords();
            await initializeDefaultData();

            if (excalidrawStore.scenes.length >= 0) {
                await excalidrawStore.selectScene(excalidrawStore.scenes[0]);
            } else {
                const scene = await excalidrawStore.createNewScene('New Scene');
                await excalidrawStore.selectScene(scene);
            }

            excalidrawStore.startPersistSceneDataLoop();

            // console.log('Image Collection:', imageStore.collection);
            // console.log('Category Collection:', categoryStore.collection);
            // console.log('Tag Collection:', tagStore.collection);
            // console.log('Excalidraw Records:', excalidrawStore.scenes);
        } catch (error) {
            console.error('Error during app initialization:', error);
            throw error;
        }
    };

    const initializeDefaultData = async (): Promise<void> => {
        // initialize default image
        let iID = '';
        let cID = '';
        let tID = '';
        try {
            if (imageStore.collection.length === 0) {
                const buffer = await getFileBufferFromPath('src/render/assets/default.webp');
                const payload: ImageFilePayload = {
                    name: 'cutefox',
                    size: buffer.length,
                    data: buffer,
                    hash: 'defaulthashwithcutefox',
                    mimeType: 'image/webp',
                };

                await imageStore.createImage(payload.name, payload);
            }
        } catch (error) {
            console.error('Failed to initialize default image:', error);
            throw error;
        }

        // initialize default category
        try {
            if (categoryStore.collection.length === 0) {
                cID = await categoryStore.create('Your Category');
            }
        } catch (error) {
            console.error('Failed to initialize default category:', error);
            throw error;
        }

        // initialize default tag
        try {
            if (tagStore.collection.length === 0) {
                tID = await tagStore.create('Your Tag');
            }
        } catch (error) {
            console.error('Failed to initialize default tag:', error);
            throw error;
        }

        // assign default category and tag to default image
        try {
            if (iID && cID) {
                await categoryStore.assignToImage(iID, cID);
                await tagStore.assignToImage(iID, tID);
            }
        } catch (error) {
            console.error('Failed to assign default category and tag to default image:', error);
        }
    };

    return { initializeApp };
};
