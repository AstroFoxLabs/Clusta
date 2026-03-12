import { serializeAsJSON } from '@excalidraw/excalidraw';
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { ActiveTool, AppState, BinaryFiles, ToolType } from '@excalidraw/excalidraw/types';
import { ipcAPI } from '@render/services/ipcAPIService';
import { ExcalidrawScene, ExcalidrawSceneData, ExcalidrawSceneRecord, UUID } from '@shared/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * We intentionally separate scene "records" from scene "data".
 *
 * - Records (ExcalidrawSceneRecord): lightweight metadata (uuid, name, etc.)
 * - Data (ExcalidrawSceneData): full Excalidraw payload (elements, appState, files)
 *
 * Allows lazy-loading scene data only when a scene is selected,
 * avoiding loading all scene content into memory at startup.
 */

import { upsert } from '@render/utils';
import { useNotificationStore } from './notificationStore';
import { useSettingsStore } from './settingsStore';

export const useExcalidrawStore = defineStore('excalidraw', () => {
    /* ---------------------------- STORES ---------------------------- */

    const settingsStore = useSettingsStore();
    const notificationStore = useNotificationStore();

    /* ---------------------------- STATES ---------------------------- */

    const scenes = ref<ExcalidrawScene[]>([]);
    const selectedScene = ref<ExcalidrawScene | null>(null);

    const persistIntervalID = ref<number | null>(null);
    const persistIntervalMs = computed(() => settingsStore.settings.excalidraw.saveIntervalSeconds * 1000);

    const sceneInitialData: ExcalidrawSceneData = {
        elements: [] as ExcalidrawElement[],
        files: {} as BinaryFiles,
        appState: {
            showWelcomeScreen: true,
            theme: 'light',
            viewBackgroundColor: '#202628',
            gridModeEnabled: false,
            objectsSnapModeEnabled: true,
            zenModeEnabled: false,
            currentItemStrokeColor: '#ededed',
            penMode: true,
            activeTool: {
                type: 'freedraw' as ToolType,
                customType: null,
                lastActiveTool: null,
                locked: true,
                fromSelection: false,
            } as ActiveTool,
            openSidebar: null,
        } as AppState,
        scrollToContent: true,
    } as ExcalidrawSceneData;

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    /* ----------------------------- ACTIONS ------------------------- */

    const updateRecord = async (record: ExcalidrawSceneRecord): Promise<ExcalidrawSceneRecord> => {
        try {
            await ipcAPI<ExcalidrawSceneRecord>(() => window.excalidraw.update(JSON.parse(JSON.stringify(record))));
            const updatedRecord = await ipcAPI<ExcalidrawSceneRecord>(() => window.excalidraw.getRecord(record.uuid));
            return upsert([updatedRecord], scenes.value, 'uuid') as ExcalidrawSceneRecord;
        } catch (error) {
            notificationStore.addEventMessage('Failed to update excalidraw record');
            console.error('Error updating excalidraw record:', error);
            throw error;
        }
    };

    const deleteScene = async (uuid: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.excalidraw.deleteRecord(uuid));
            scenes.value = scenes.value.filter((r) => r.uuid !== uuid);
            await ipcAPI<void>(() => window.excalidraw.deleteSceneData(uuid));
        } catch (error) {
            notificationStore.addEventMessage('Failed to delete excalidraw record');
            console.error('Error deleting excalidraw record:', error);
            throw error;
        }
    };

    const fetchAllRecords = async (): Promise<ExcalidrawSceneRecord[]> => {
        try {
            const records = await ipcAPI<ExcalidrawSceneRecord[]>(() => window.excalidraw.allRecords());
            if (records.length === 0) {
                console.warn('No excalidraw records found when fetching all records');
                return scenes.value;
            }
            return upsert([...records], scenes.value, 'uuid') as ExcalidrawSceneRecord[];
        } catch (error) {
            notificationStore.addEventMessage('Failed to fetch excalidraw records');
            console.error('Error fetching excalidraw records:', error);
            throw error;
        }
    };

    const fetchSceneData = async (uuid: UUID): Promise<ExcalidrawScene> => {
        try {
            const data = await ipcAPI<ExcalidrawSceneData>(() => window.excalidraw.getSceneData(uuid));
            return {
                uuid,
                name: scenes.value.find((s) => s.uuid === uuid)?.name ?? 'Unknown Scene',
                ...data,
            } as ExcalidrawScene;
        } catch (error) {
            notificationStore.addEventMessage('Failed to fetch excalidraw scene data');
            console.error(`Error fetching excalidraw scene data for record ${uuid}:`, error);
            throw error;
        }
    };

    const persistSceneData = async (scene: ExcalidrawSceneData, uuid: UUID): Promise<ExcalidrawSceneData> => {
        if (!scene.elements || !scene.appState || !scene.files) {
            throw new Error(
                `Scene data for record with uuid ${uuid} is missing elements or appState or files when persisting scene data`,
            );
        }
        let sceneData: ExcalidrawSceneData;
        try {
            // Striping away non-serializable properties
            const strippedScene = JSON.parse(serializeAsJSON(scene.elements, scene.appState, scene.files, 'local'));
            sceneData = {
                elements: strippedScene.elements,
                appState: strippedScene.appState,
                files: strippedScene.files,
            };
            return await ipcAPI<ExcalidrawSceneData>(() => window.excalidraw.persistSceneData(sceneData, uuid));
        } catch (error) {
            notificationStore.addEventMessage('Failed to persist excalidraw scene data');
            console.error(`Error persisting excalidraw scene data for record ${uuid}:`, error);
            throw error;
        }
    };

    const startPersistSceneDataLoop = (): void => {
        if (persistIntervalID.value) {
            clearInterval(persistIntervalID.value);
        }
        persistIntervalID.value = window.setInterval(async () => {
            for (const scene of scenes.value) {
                try {
                    if (scene.mutated) {
                        await persistSceneData(scene, scene.uuid);
                        scene.mutated = false;
                    }
                } catch (error) {
                    notificationStore.addEventMessage(`Excalidraw persist failed: ${scene.name}`);
                    console.error(`Failed to persist scene data for record ${scene.uuid}:`, error);
                }
            }
        }, persistIntervalMs.value);
    };

    const selectScene = async (scene: ExcalidrawScene | null): Promise<void> => {
        if (!scene) {
            selectedScene.value = null;
            return;
        }

        if (scene === selectedScene.value) return;

        // No Data => fetch it (Lazy Loading)
        if (!scene.appState || !scene.elements || !scene.files) {
            console.warn(`${scene.uuid} is missing appstate / elements / files... Fetching data.`);
            try {
                Object.assign(scene, await fetchSceneData(scene.uuid));
            } catch (error) {
                notificationStore.addEventMessage('Failed to load excalidraw scene data');
                console.error(`Failed to load scene data for record ${scene.uuid}. Setting null now`, error);
                scene = null;
            }
        }
        selectedScene.value = scene;
    };

    // Skips SceneData creation, happens at scene selection
    const createNewScene = async (name: string): Promise<ExcalidrawScene> => {
        try {
            const createRecord = async (name: string): Promise<ExcalidrawScene> => {
                const uuid = await ipcAPI<string>(() => window.excalidraw.createRecord(crypto.randomUUID(), name));
                const record = await ipcAPI<ExcalidrawSceneRecord>(() => window.excalidraw.getRecord(uuid));

                return {
                    uuid: record.uuid,
                    name: record.name,
                    ...sceneInitialData,
                } as ExcalidrawScene;
            };
            const resScene = await createRecord(name);
            return upsert([resScene], scenes.value, 'uuid') as ExcalidrawScene;
        } catch (error) {
            notificationStore.addEventMessage('Failed to create new excalidraw scene');
            console.error('Error creating new excalidraw scene:', error);
            throw error;
        }
    };

    const clearScene = async (uuid: UUID): Promise<void> => {
        let scene = scenes.value.find((s) => s.uuid === uuid);
        if (!scene) {
            console.error(`Scene with uuid ${uuid} not found when trying to clear scene`);
            return;
        }
        // Workaround to clear the cache of the component, otherwise clearing the selected scene does not work.
        if (selectedScene.value?.uuid === uuid) {
            await selectScene(null);
        }

        scene.elements = [];
        scene.files = {};
        scene.appState = { ...sceneInitialData.appState };
        scene.mutated = true; // Mark as mutated so that it gets persisted in the next persist loop iteration
        await selectScene(scene);
    };

    return {
        scenes,
        sceneInitialData,
        selectedScene,
        selectScene,
        fetchAllRecords,
        deleteScene,
        fetchSceneData,
        upsert,
        updateRecord,
        persistSceneData,
        startPersistSceneDataLoop,
        createNewScene,
        clearScene,
    };
});
