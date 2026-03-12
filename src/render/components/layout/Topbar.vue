<template lang="html">
    <div class="topbar">
        <div class="topbar-actions">
            <div class="topbar-actions-extra">
                <slot name="actions"> </slot>
            </div>
            <div class="topbar-actions-settings">
                <Icon codicon-name="settings-gear" @click="toggleSettings" />
            </div>
            <div class="topbar-actions-app-window">
                <div class="codicon codicon-chrome-minimize" @click="minimizeWindow"></div>
                <div class="codicon codicon-chrome-restore" @click="restoreWindow"></div>
                <div class="codicon codicon-close" @click="closeWindow"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '@render/components/core/Icon.vue';
import router from '@render/router';
import { ipcAPI } from '@render/services/ipcAPIService';

// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const minimizeWindow = async () => {
    await ipcAPI(() => window.appWindow.minimize());
};

const restoreWindow = async () => {
    await ipcAPI(() => window.appWindow.maximize());
};

const closeWindow = async () => {
    await ipcAPI(() => window.appWindow.close());
};

const toggleSettings = () => {
    if (router.currentRoute.value.name !== 'settings') {
        router.push('settings');
    } else {
        router.push('/');
    }
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.topbar {
    -webkit-app-region: drag; // Ignore IDE warning. Needed to make the topbar draggable.
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: end;
    border-bottom: 1px solid $primary-700;
    margin-bottom: 0.5rem;
    height: 3rem;

    * {
        -webkit-app-region: no-drag; // Ignore IDE warning. Needed to make buttons clickable.
    }

    &-actions {
        display: flex;
        gap: 1rem;
        height: 100%;
        align-items: center;

        &-extra {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            height: 100%;
            align-items: center;
        }

        &-app-window {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 100%;

            * {
                cursor: pointer;
                height: 3rem;
                width: 3rem;
                align-content: center;

                &:hover {
                    background-color: $white-trans-25;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
