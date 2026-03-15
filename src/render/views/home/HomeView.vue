<template lang="html">
    <Topbar>
        <template #actions>
            <Icon @click="onOpenFileExplorer" codiconName="folder" title="Upload Images from Disk"></Icon>
            <Icon @click="mirrorSplit = !mirrorSplit" title="Mirror Split">
                <svg width="59" height="16" viewBox="0 0 59 16" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="2" />
                    <path
                        d="M17.6464 7.64645C17.4512 7.84171 17.4512 8.15829 17.6464 8.35355L20.8284 11.5355C21.0237 11.7308 21.3403 11.7308 21.5355 11.5355C21.7308 11.3403 21.7308 11.0237 21.5355 10.8284L18.7071 8L21.5355 5.17157C21.7308 4.97631 21.7308 4.65973 21.5355 4.46447C21.3403 4.2692 21.0237 4.2692 20.8284 4.46447L17.6464 7.64645ZM41.3536 8.35355C41.5488 8.15829 41.5488 7.84171 41.3536 7.64645L38.1716 4.46447C37.9763 4.2692 37.6597 4.2692 37.4645 4.46447C37.2692 4.65973 37.2692 4.97631 37.4645 5.17157L40.2929 8L37.4645 10.8284C37.2692 11.0237 37.2692 11.3403 37.4645 11.5355C37.6597 11.7308 37.9763 11.7308 38.1716 11.5355L41.3536 8.35355ZM18 8V8.5H41V8V7.5H18V8Z"
                    />
                    <rect x="43" width="16" height="16" rx="2" />
                </svg>
            </Icon>
            <Icon @click="splitMode = 'LeftFull'" title="Grid to Fullscreen">
                <svg width="23" height="16" viewBox="0 0 23 16" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="2" />
                    <rect x="18" width="5" height="16" rx="2" />
                </svg>
            </Icon>
            <Icon @click="splitMode = 'Equal'" title="Equal Windows">
                <svg width="34" height="16" viewBox="0 0 34 16" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="2" />
                    <rect x="18" width="16" height="16" rx="2" />
                </svg>
            </Icon>
            <Icon @click="splitMode = 'RightFull'" title="Artboard to Fullscreen">
                <svg width="23" height="16" viewBox="0 0 23 16" xmlns="http://www.w3.org/2000/svg">
                    <rect width="5" height="16" rx="2" />
                    <rect x="7" width="16" height="16" rx="2" />
                </svg>
            </Icon>
        </template>
    </Topbar>
    <div class="home-view">
        <div class="home-view-content">
            <SplitPane :mode="splitMode" :mirror="mirrorSplit">
                <template #left>
                    <CatalogImageGrid />
                </template>
                <template #right>
                    <SceneWorkspacePanel />
                </template>
            </SplitPane>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '@render/components/core/Icon.vue';
import SplitPane from '@render/components/core/SplitPane.vue';
import Topbar from '@render/components/layout/Topbar.vue';
import { useNotificationStore } from '@render/stores/notificationStore';
import { openFileExplorerForImageUpload, uploadFileList } from '@render/utils';
import { ref } from 'vue';
import CatalogImageGrid from './components/CatalogImageGrid.vue';
import SceneWorkspacePanel from './components/SceneWorkspacePanel.vue';

// --- PROPS & EMITS ---

// --- STORES ---

const notificationStore = useNotificationStore();

// --- STATES ---

const splitMode = ref<'LeftFull' | 'Equal' | 'RightFull'>('Equal');
const mirrorSplit = ref(false);
// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onOpenFileExplorer = async () => {
    await openFileExplorerForImageUpload(async (f: FileList) => {
        try {
            await uploadFileList(f);
        } catch (err) {
            console.error('Failed to upload files from explorer:', err);
            notificationStore.addEventMessage('Failed to upload files from explorer!');
        }
    });
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.home-view {
    width: 100%;
    height: 94%; // Account for topbar height
    overflow: hidden;
    padding: 0 0.5rem;
    position: relative;
    z-index: 1;

    &-content {
        height: 100%; // Account for topbar height
    }
}
</style>
