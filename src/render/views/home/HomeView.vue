<template lang="html">
    <Topbar>
        <template #actions>
            <Icon name="icon_splitpane_mirror" @click="mirrorSplit = !mirrorSplit" title="Mirror Split" />
            <Icon name="icon_splitpane_left_full" @click="splitMode = 'LeftFull'" title="Grid to Fullscreen" />
            <Icon name="icon_splitpane_equal" @click="splitMode = 'Equal'" title="Equal Windows" />
            <Icon name="icon_splitpane_right_full" @click="splitMode = 'RightFull'" title="Artboard to Fullscreen" />
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
import { ref } from 'vue';
import CatalogImageGrid from './components/CatalogImageGrid.vue';
import SceneWorkspacePanel from './components/SceneWorkspacePanel.vue';

// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

const splitMode = ref<'LeftFull' | 'Equal' | 'RightFull'>('Equal');
const mirrorSplit = ref(false);
// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
@use '../../styles/variables' as *;

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
