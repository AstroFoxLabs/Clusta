<template>
    <div ref="host" class="excalidraw-react excalidraw--mobile"></div>
</template>

<script setup lang="ts">
import { convertToExcalidrawElements, Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import '@excalidraw/excalidraw/index.css';
import type {
    AppState,
    BinaryFileData,
    BinaryFiles,
    ExcalidrawImperativeAPI,
    ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types';
import { useExcalidrawStore } from '@render/stores/excalidrawStore';
import { useNotificationStore } from '@render/stores/notificationStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { bitmapToBlob, blobToBase64, getBitmapFromURL, isUrl } from '@render/utils';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

type ExcalidrawSceneDataCache = {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: BinaryFiles;
};

// --- PROPS & EMITS ---

// --- STORES ---

const excalidrawStore = useExcalidrawStore();
const settingsStore = useSettingsStore();
const notificationStore = useNotificationStore();

// --- STATES ---

let root: Root | null = null;
const host = ref<HTMLElement | null>(null);
let excalidrawAPI: ExcalidrawImperativeAPI;

const cache = ref<ExcalidrawSceneDataCache>({
    elements: [],
    appState: {} as AppState,
    files: {} as BinaryFiles,
});

// const elementsCache = ref<readonly ExcalidrawElement[]>([]);
// const appStateCache = ref<AppState>({} as AppState);
// const filesCache = ref<BinaryFiles>({} as BinaryFiles);

const cursorPositionScene = ref({ x: 0, y: 0 });
const updateInterval = ref<number | null>(null);

// --- COMPUTED ---

// --- WATCHERS ---

watch(
    () => excalidrawStore.selectedScene,
    async (newScene) => {
        excalidrawAPI.resetScene();

        if (!newScene || !newScene.elements || !newScene.appState) {
            const scene = await excalidrawStore.createNewScene('New Scene');
            await excalidrawStore.selectScene(scene);
            return;
        }

        const defaultAppState = { ...excalidrawAPI.getAppState() };

        excalidrawAPI.updateScene({
            elements: newScene.elements,
            appState: Object.assign(newScene.appState, defaultAppState),
        });
        if (newScene.files && Object.keys(newScene.files).length !== 0) {
            // BinaryFIles are a Record<ID, Data>. We only need the Data.
            excalidrawAPI.addFiles(Object.values(newScene.files));
        }
    },
);

// --- METHODS ---

const beginSceneUpdateInterval = () => {
    if (updateInterval.value !== null) {
        console.warn('Update interval is already running with ID:', updateInterval.value);
        return;
    }

    updateInterval.value = window.setInterval(() => {
        if (!excalidrawStore.selectedScene) {
            console.warn('No focused scene set, skipping update');
            return;
        }

        excalidrawStore.selectedScene.elements = cache.value.elements;
        excalidrawStore.selectedScene.appState = cache.value.appState;
        excalidrawStore.selectedScene.files = cache.value.files;
        excalidrawStore.selectedScene.mutated = true;
    }, 1000);
};

onMounted(() => {
    if (!host.value) return;

    if (!settingsStore.settings.excalidraw.disableStyleOverride) {
        host.value.classList.add('excalidraw-override');
    }

    beginSceneUpdateInterval();

    // Excalidraw uses React, not Vue.
    // Creates its own DOM Tree inside the host element. Attaches it to the host element provided by Vue.
    // Vue has no control but we can communicate via props and callbacks and Excalidraw's imperative API.
    root = createRoot(host.value);
    root.render(
        React.createElement(Excalidraw, {
            initialData: (): ExcalidrawInitialDataState => {
                if (excalidrawStore.selectedScene) {
                    return {
                        elements: excalidrawStore.selectedScene.elements,
                        appState: excalidrawStore.sceneInitialData.appState,
                        files: excalidrawStore.selectedScene.files,
                    };
                } else {
                    return excalidrawStore.sceneInitialData;
                }
            },
            onChange: (elements: readonly ExcalidrawElement[], state: AppState, files: BinaryFiles) => {
                cache.value = { ...cache.value, elements, appState: state, files };
            },
            onPointerUpdate(payload) {
                cursorPositionScene.value = {
                    x: payload.pointer.x,
                    y: payload.pointer.y,
                };
            },
            onPaste: async (data, event) => {
                if (data.text && data.text.length > 0) {
                    if (!isUrl(data.text)) {
                        console.warn(
                            'Pasted text is not a valid URL, falling back to default pasting behavior:',
                            data.text,
                        );
                        return true;
                    }
                    try {
                        const el = (await createImageElementFromURL(data.text)) as ExcalidrawElement;
                        excalidrawAPI.updateScene({
                            elements: [...excalidrawAPI.getSceneElements(), el],
                        });
                        return false; // prevent default pasting behavior
                    } catch (err) {
                        notificationStore.addEventMessage('Failed to paste image from URL');
                        console.error('Error pasting image from URL:', err);
                    }
                }
                return false;
            },
            generateIdForFile: () => {
                // change to selection when pasting file
                excalidrawAPI.setActiveTool({ type: 'selection' });
                return `file-${Date.now()}`;
            },
            excalidrawAPI: (api) => {
                excalidrawAPI = api;
            },
        }),
    );
});

onBeforeUnmount(() => {
    if (updateInterval.value !== null) {
        window.clearInterval(updateInterval.value);
        updateInterval.value = null;
    }
    root?.unmount();
    root = null;
});

const createImageElementFromURL = async (url: string): Promise<ExcalidrawElementSkeleton> => {
    const imageBitmap = await getBitmapFromURL(url);
    const bitmapBlob = await bitmapToBlob(imageBitmap);
    const { width, height } = imageBitmap;

    const id = `pasted-image-${Date.now()}`;
    const file = new File([bitmapBlob], id, { type: bitmapBlob.type });

    excalidrawAPI.addFiles([
        {
            id,
            dataURL: await blobToBase64(bitmapBlob),
            mimeType: file.type,
            created: Date.now(),
        },
    ] as BinaryFileData[]);

    const element = convertToExcalidrawElements([
        {
            type: 'image',
            fileId: id,
            status: 'saved',
            id: `element-${id}`,
            scale: [1, 1],
            crop: null,
            x: cursorPositionScene.value.x,
            y: cursorPositionScene.value.y,
            width: width,
            height: height,
        } as ExcalidrawElementSkeleton,
    ]);
    return element[0] as ExcalidrawElementSkeleton;
};
</script>

<style lang="scss">
@use '@render/styles/variables' as *;

.excalidraw-react {
    width: 100%;
    height: 97%;

    :deep(.ToolIcon__lock) {
        display: none !important;
    }
}

.excalidraw-override {
    // Hiding features that are not revelant in the app
    // Mobile
    .excalidraw--mobile {
        .dropdown-menu-button.App-toolbar__extra-tools-trigger.zen-mode-transition.dropdown-menu-button--mobile {
            display: none !important;
        }

        label[title='Library'] {
            display: none !important;
        }
        .App-menu_top__left {
            display: none !important;
        }

        footer {
            .dropdown-menu-button {
                display: none !important;
            }
        }
    }

    // Desktop
    :not(.excalidraw--mobile) {
        label[title='Library'] {
            display: none !important;
        }

        .main-menu-trigger {
            display: none !important;
        }

        .App-menu__left {
            position: static;
        }

        button[title='More tools'] {
            display: none !important;
        }

        .help-icon {
            display: none !important;
        }
    }
}
</style>
