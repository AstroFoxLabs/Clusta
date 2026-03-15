import { useCategoryStore } from '@render/stores/categoryStore';
import { useExcalidrawStore } from '@render/stores/excalidrawStore';
import { useImageStore } from '@render/stores/imageStore';
import { useNotificationStore } from '@render/stores/notificationStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { useTagStore } from '@render/stores/tagStore';

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
        } catch (err) {
            notificationStore.addEventMessage('Failed to initialize app. Check Logs or contact Developer.');
            console.error('Error during app initialization:', err);
            throw err;
        }
    };

    return { initializeApp };
};
