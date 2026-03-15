<template lang="html">
    <div class="scene-workspace-panel">
        <div class="scene-workspace-panel-scenes">
            <ToggleButton
                class="scene-workspace-panel-scenes-toggle"
                @on-change="(e: PointerEvent, v) => onSelectScene(e, scene.uuid)"
                @click.right="(e: PointerEvent) => onSceneRightClick(e, scene.uuid)"
                v-for="scene in excalidrawStore.scenes"
                :item="{
                    state: scene.uuid === excalidrawStore.selectedScene?.uuid,
                    displayValue: scene.name,
                    value: scene.uuid,
                }"
            />
            <InlineButtonInput @on-submit="onSubmitNewScene" class="scene-workspace-panel-scenes-add">
                <Icon codicon-name="add"></Icon>
            </InlineButtonInput>
        </div>
        <Excalidraw v-if="excalidrawStore.selectedScene" />
        <div class="scene-workspace-panel-empty-scene"></div>
    </div>
</template>

<script setup lang="ts">
import Icon from '@render/components/core/Icon.vue';
import InlineButtonInput from '@render/components/core/InlineButtonInput.vue';
import ToggleButton from '@render/components/core/ToggleButton.vue';
import Excalidraw from '@render/components/features/Excalidraw.vue';
import type { RightClickMenu } from '@render/stores/appStore';
import { useAppStore } from '@render/stores/appStore';
import { useExcalidrawStore } from '@render/stores/excalidrawStore';
import type { ModalDialog, ModalInput } from '@render/stores/modalStore';
import { useModalStore } from '@render/stores/modalStore';

// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

const appStore = useAppStore();
const excalidrawStore = useExcalidrawStore();
const modalStore = useModalStore();

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onSelectScene = (e: PointerEvent, uuid: string) => {
    const scene = excalidrawStore.scenes.find((s) => s.uuid === uuid);
    if (!scene) {
        console.warn('Selected scene not found for UUID:', uuid);
        return;
    }
    excalidrawStore.selectScene(scene);
};

const onSceneRightClick = (e: PointerEvent, uuid: string) => {
    appStore.setRightClickMenu({
        x: e.clientX,
        y: e.clientY,
        cb: [
            {
                label: 'Rename Scene',
                cb: async () => {
                    const s = excalidrawStore.scenes.find((s) => s.uuid === uuid);
                    if (!s) {
                        console.warn('Scene not found for UUID:', uuid);
                        return;
                    }
                    modalStore.setModal({
                        title: 'Rename Scene',
                        description: 'Enter a new name for the scene:',
                        type: 'input',
                        inputLabel: 'Scene Name',
                        inputPlaceholder: 'New scene name',
                        initialValue: excalidrawStore.scenes.find((s) => s.uuid === uuid)?.name,
                        onConfirm: {
                            label: 'Confirm',
                            cb: async (newName: string) => {
                                await excalidrawStore.updateRecord({ ...s, name: newName });
                                modalStore.setModal(null);
                            },
                        },
                        onCancel: {
                            label: 'Cancel',
                            cb: () => {
                                modalStore.setModal(null);
                            },
                        },
                    } as ModalInput);
                },
            },
            {
                label: 'Delete Scene',
                cb: async () => {
                    modalStore.setModal({
                        title: 'Delete Scene',
                        description: 'Are you sure you want to delete this scene?',
                        type: 'dialog',
                        onConfirm: {
                            label: 'Delete',
                            cb: async () => {
                                await excalidrawStore.deleteScene(uuid);
                                modalStore.setModal(null);
                            },
                        },
                        onCancel: {
                            label: 'Cancel',
                            cb: () => {
                                modalStore.setModal(null);
                            },
                        },
                    } as ModalDialog);
                },
            },
            {
                label: 'Clear Scene',
                cb: async () => {
                    modalStore.setModal({
                        title: 'Clear Scene',
                        description: 'Are you sure you want to clear all content from this scene?',
                        type: 'dialog',
                        onConfirm: {
                            label: 'Clear',
                            cb: async () => {
                                excalidrawStore.clearScene(uuid);
                                modalStore.setModal(null);
                            },
                        },
                        onCancel: {
                            label: 'Cancel',
                            cb: () => {
                                modalStore.setModal(null);
                            },
                        },
                    } as ModalDialog);
                },
            },
        ],
    } as RightClickMenu);
};

const onSubmitNewScene = async (e: KeyboardEvent, name: string) => {
    const scene = await excalidrawStore.createNewScene(name);
    await excalidrawStore.selectScene(scene);
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.scene-workspace-panel {
    height: 100%;
    padding: 1rem;

    &-scenes {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
        height: 2.5rem;

        &-toggle {
            font-size: 0.875rem;
        }

        &-add {
            font-size: 0.875rem;
        }
    }

    &-empty-scene {
        width: 100%;
        height: 100%;

        &::before {
            content: '';
            position: absolute;
            background-image: url('/assets/images/start-scene-bg.png');
            background-repeat: no-repeat;
            background-position: 0% 5%;
            background-size: 400px;
            inset: 0;
            opacity: 0.25;
            pointer-events: none;
        }
    }
}
</style>
