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
                <span class="codicon codicon-add"></span>
            </InlineButtonInput>
        </div>
        <Excalidraw v-if="excalidrawStore.selectedScene" />
    </div>
</template>

<script setup lang="ts">
    import Excalidraw from '@render/components/features/Excalidraw.vue';
    import { useExcalidrawStore } from '@render/stores/excalidrawStore';
    import { useModalStore } from '@render/stores/modalStore';
    import { useAppStore } from '@render/stores/appStore';
    import type { DialogModal, InputModal } from '@render/stores/modalStore';
    import type { RightClickMenu } from '@render/stores/appStore';
    import InlineButtonInput from '@render/components/core/InlineButtonInput.vue';
    import type { ExcalidrawScene } from '@shared/types';
    import ToggleButton from '@render/components/core/ToggleButton.vue';

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
        if (uuid === 'uncategorized' || uuid === 'all') {
            return;
        }
        appStore.setRightClickMenu({
            x: e.clientX,
            y: e.clientY,
            cb: [
                {
                    label: 'Rename Scene',
                    cb: async () => {
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
                                    await excalidrawStore.updateName(uuid, newName);
                                    modalStore.setModal(null);
                                },
                            },
                            onCancel: {
                                label: 'Cancel',
                                cb: () => {
                                    modalStore.setModal(null);
                                },
                            },
                        } as InputModal);
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
                                    await excalidrawStore.deleteSceneByUUID(uuid);
                                    modalStore.setModal(null);
                                },
                            },
                            onCancel: {
                                label: 'Cancel',
                                cb: () => {
                                    modalStore.setModal(null);
                                },
                            },
                        } as DialogModal);
                    },
                },
            ],
        } as RightClickMenu);
    };

    const onSubmitNewScene = async (e: KeyboardEvent, name: string) => {
        try {
            const scene = await excalidrawStore.createNewScene(name);
            await excalidrawStore.selectScene(scene);
        } catch (error) {
            console.error('Error creating new excalidraw scene:', error);
        }
    };
</script>

<style scoped lang="scss">
    @use '../../../styles/variables' as *;

    .scene-workspace-panel {
        height: 100%;
        padding: 1rem;

        &-scenes {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 0.75rem;

            &-toggle {
                font-size: 0.875rem;
            }

            &-add {
                font-size: 0.875rem;
            }
        }
    }
</style>
