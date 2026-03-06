import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { ActiveTool, AppState, BinaryFiles, ExcalidrawInitialDataState, ToolType } from '@excalidraw/excalidraw/types';
import { ImportedDataState } from '@excalidraw/excalidraw/data/types';
import { ipcAPI } from '@render/services/ipcAPIService';
import { ExcalidrawScene, ExcalidrawSceneData, ExcalidrawSceneRecord } from '@shared/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { serializeAsJSON } from '@excalidraw/excalidraw';

/**
 * We intentionally separate scene "records" from scene "data".
 *
 * - Records (ExcalidrawSceneRecord): lightweight metadata (uuid, name, etc.)
 * - Data (ExcalidrawSceneData): full Excalidraw payload (elements, appState, files)
 *
 * Allows lazy-loading scene data only when a scene is selected,
 * avoiding loading all scene content into memory at startup.
 */

import { useSettingsStore } from './settingsStore';

export const useExcalidrawStore = defineStore('excalidraw', () => {
    /* ---------------------------- STORES ---------------------------- */

    const settingsStore = useSettingsStore();
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

    const upsert = (newScenes: ExcalidrawScene[]): void => {
        newScenes.forEach((nScene) => {
            const index = scenes.value.findIndex((s) => s.uuid === nScene.uuid);
            if (index === -1) {
                scenes.value.push(nScene);
            } else {
                Object.assign(scenes.value[index], nScene);
            }
        });
    };

    /* ----------------------------- ACTIONS ------------------------- */

    const updateName = async (uuid: string, name: string): Promise<string> => {
        try {
            const record = scenes.value.find((r) => r.uuid === uuid);
            if (!record) {
                throw new Error(`Scene record with uuid ${uuid} not found in store collection`);
            }
            await ipcAPI<void>(() => window.excalidraw.updateRecordName(uuid, name));
            Object.assign(record, { name });
            return record.name;
        } catch (error) {
            console.error(`Failed to update name for excalidraw record with uuid ${uuid}:`, error);
            throw error;
        }
    };

    const deleteScene = async (uuid: string): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.excalidraw.deleteRecord(uuid));
            scenes.value = scenes.value.filter((r) => r.uuid !== uuid);
        } catch (error) {
            console.error(`Failed to delete excalidraw record with uuid ${uuid}:`, error);
            throw error;
        }

        try {
            await ipcAPI<void>(() => window.excalidraw.deleteSceneData(uuid));
        } catch (error) {
            console.error(
                `Failed to delete excalidraw scene data with uuid ${uuid}. Will be cleaned up on startup:`,
                error,
            );
        }
    };

    const fetchAllRecords = async (): Promise<ExcalidrawSceneRecord[]> => {
        try {
            const records = await ipcAPI<ExcalidrawSceneRecord[]>(() => window.excalidraw.allRecords());

            if (!records || records.length === 0) {
                console.warn('No excalidraw records found when fetching all records');
            }

            upsert([...records]);
            return records;
        } catch (error) {
            console.error('Failed to fetch all excalidraw records:', error);
            throw error;
        }
    };

    const fetchRecordByUUID = async (uuid: string): Promise<ExcalidrawSceneRecord | null> => {
        try {
            const record = await ipcAPI<ExcalidrawSceneRecord>(() => window.excalidraw.getRecord(uuid));

            if (!record) {
                console.warn(`No excalidraw record found with uuid ${uuid}`);
                return null;
            }

            upsert([record]);
            return record;
        } catch (error) {
            console.error(`Failed to fetch excalidraw record with uuid ${uuid}:`, error);
            return null;
        }
    };

    const fetchSceneData = async (uuid: string): Promise<ExcalidrawSceneData> => {
        try {
            return await ipcAPI<ExcalidrawSceneData>(() => window.excalidraw.getSceneData(uuid));
        } catch (error) {
            console.error(`Failed to load scene data for record ${uuid}:`, error);
            throw error;
        }
    };

    const persistSceneData = async (scene: ExcalidrawSceneData, uuid: string): Promise<ExcalidrawSceneData> => {
        try {
            if (!scene.elements || !scene.appState || !scene.files) {
                throw new Error(
                    `Scene data for record with uuid ${uuid} is missing elements or appState or files when persisting scene data`,
                );
            }

            // Striping away non-serializable properties and ensuring all required properties are present for serialization
            const strippedScene = JSON.parse(serializeAsJSON(scene.elements, scene.appState, scene.files, 'local'));

            const sceneData: ExcalidrawSceneData = {
                elements: strippedScene.elements,
                appState: strippedScene.appState,
                files: strippedScene.files,
            };
            return await ipcAPI<ExcalidrawSceneData>(() => window.excalidraw.persistSceneData(sceneData, uuid));
        } catch (error) {
            console.error('Failed to store excalidraw scene:', error);
            throw error;
        }
    };

    // Checks periodically if scene data has been mutated and persists it if so.
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
                    console.error(`Failed to persist scene data for record ${scene.uuid}:`, error);
                }
            }
        }, persistIntervalMs.value);
    };

    // Loads scene data when selecting a scene if not already loaded and sets selectedScene
    const selectScene = async (scene: ExcalidrawScene | null): Promise<void> => {
        if (!scene) {
            selectedScene.value = null;
            return;
        }

        // Possible scene has no data yet, so we fetch it (Lazy Loading)
        if (!scene.appState || !scene.elements || !scene.files) {
            try {
                console.warn(
                    `Scene with uuid ${scene?.uuid} is missing appState or elements or files
                    when selecting scene. Loading scene data...`,
                );
                const data = await fetchSceneData(scene.uuid);
                Object.assign(scene, data);
            } catch (error) {
                console.error(`Failed to load scene data for record ${scene?.uuid} when selecting scene:`, error);
                scene = null;
            }
        }
        selectedScene.value = scene;
    };

    const createNewScene = async (name: string): Promise<ExcalidrawScene> => {
        const createRecord = async (name: string): Promise<string> => {
            try {
                const record = await ipcAPI<ExcalidrawSceneRecord>(() =>
                    window.excalidraw.createRecord(crypto.randomUUID(), name),
                );
                upsert([record]);
                return record.uuid;
            } catch (error) {
                console.error('Failed to create excalidraw record:', error);
                throw error;
            }
        };

        try {
            const uuid = await createRecord(name);
            const record = scenes.value.find((r) => r.uuid === uuid);
            if (!record) throw Error('Record could not be created.');
            await persistSceneData(sceneInitialData, record.uuid);
            return record;
        } catch (error) {
            console.error('Failed to create a new Excalidraw Scene:', error);
            throw error;
        }
    };

    return {
        scenes,
        sceneInitialData,
        selectedScene,
        selectScene,
        fetchAllRecords,
        fetchRecordByUUID,
        deleteSceneByUUID: deleteScene,
        updateName,
        fetchSceneData,
        upsert,
        persistSceneData,
        startPersistSceneDataLoop,
        createNewScene,
    };
});
