import { useCategoryStore } from '@render/stores/categoryStore';
import { useExcalidrawStore } from '@render/stores/excalidrawStore';
import { useImageStore } from '@render/stores/imageStore';
import { useNotificationStore } from '@render/stores/notificationStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { useTagStore } from '@render/stores/tagStore';
import { getFileBufferFromPath } from '@render/utils';
import { ImageFilePayload } from '@shared/types';

// Closure to make sure the stores are available before the application is fully loaded
export const useAppBootstrap = async () => {
    const imageStore = useImageStore();
    const categoryStore = useCategoryStore();
    const tagStore = useTagStore();
    const excalidrawStore = useExcalidrawStore();
    const settingsStore = useSettingsStore();
    const notificationStore = useNotificationStore();

    const initializeApp = async (): Promise<void> => {
        try {
            await settingsStore.loadSettings();
            await imageStore.fetchAll();
            await categoryStore.fetchAll();
            await tagStore.fetchAll();
            await excalidrawStore.fetchAllRecords();
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
            notificationStore.addEventMessage('Failed to initialize app. Check Logs or contact Developer.');
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
                const buffer = await getFileBufferFromPath('src/render/public/assets/default.webp');
                const payload: ImageFilePayload = {
                    name: 'cutefox',
                    size: buffer.length,
                    data: buffer,
                    hash: 'defaulthashwithcutefox',
                    mimeType: 'image/webp',
                };

                await imageStore.create(payload.name, payload);
            }
        } catch (error) {
            console.error('Failed to initialize default image:', error);
            throw error;
        }

        // initialize default category
        try {
            if (categoryStore.collection.length === 0) {
                await categoryStore.create('Your Category');
            }
        } catch (error) {
            console.error('Failed to initialize default category:', error);
            throw error;
        }

        // initialize default tag
        try {
            if (tagStore.collection.length === 0) {
                await tagStore.create('Your Tag');
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
