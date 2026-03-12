<template lang="html">
    <Topbar />
    <div class="settings-view">
        <div class="settings-view-controls">
            <FieldGroup class="field-group">
                <template #title>App Settings</template>
                <Field label="Always on Top" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.app.alwaysOnTop" />
                </Field>
            </FieldGroup>
            <FieldGroup class="field-group">
                <template #title>Image Saving Settings</template>
                <Field label="Format (WIP)" class="field">
                    <select v-model="tmpSettings.image.conversion.format" disabled="true">
                        <option v-for="format in Object.keys(ALLOWED_IMAGE_TYPES)" :key="format" :value="format">
                            {{ format }}
                        </option>
                    </select>
                </Field>
                <Field label="Quality (0-100)" class="field">
                    <InputField type="number" v-model.number="tmpSettings.image.conversion.quality" min="0" max="100" />
                </Field>
                <Field label="Lossless" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.image.conversion.lossless" />
                </Field>
                <Field label="Animated (only for GIF/WebP)" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.image.conversion.animated" />
                </Field>
                <Field label="Max Size (MB)" class="field">
                    <InputField type="number" v-model.number="tmpSettings.image.maxSizeMB" min="0" />
                </Field>
            </FieldGroup>
            <FieldGroup class="field-group">
                <template #title>Excalidraw Settings</template>
                <Field label="Save Interval (Seconds)" class="field">
                    <InputField v-model.number="tmpSettings.excalidraw.saveIntervalSeconds" min="0" type="number" />
                </Field>
                <Field label="Disable Style Override" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.excalidraw.disableStyleOverride" />
                </Field>
            </FieldGroup>
            <FieldGroup class="field-group">
                <template #title>Grid Settings</template>
                <Field label="Disable Filter" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.grid.disableFilter" />
                </Field>
                <Field label="Show Favorites First" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.grid.showFavoritesFirst" />
                </Field>
                <Field label="Show 'All' Category" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.grid.showCategoryAll" />
                </Field>
                <Field label="Show 'Uncategorized' Category" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.grid.showCategoryUncategorized" />
                </Field>
            </FieldGroup>
            <FieldGroup class="field-group">
                <template #title>Backup Settings (WIP - NOT WORKING YET)</template>
                <Field label="Enable Auto Backup" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.backup.enableAutoBackup" :disabled="true" />
                </Field>
                <Field label="Backup Interval (Minutes)" class="field">
                    <InputField
                        v-model.number="tmpSettings.backup.backupIntervalMinutes"
                        min="0"
                        type="number"
                        disabled="true"
                    />
                </Field>
            </FieldGroup>
            <FieldGroup class="field-group">
                <template #title>Clean Up</template>
                <Field label="Delete all Tags" class="field">
                    <div class="settings-view-actions-tags">
                        <button @click="onDeleteAllTags">Delete All Tags</button>
                        <div>All Current Tags: {{ tagCollectionNames }}</div>
                    </div>
                </Field>
                <Field label="Delete all Images" class="field">
                    <div class="settings-view-actions-tags">
                        <button @click="onDeleteAllImages">Delete All Images</button>
                        <div>Image Count: {{ imageStore.collection.length }}</div>
                    </div>
                </Field>
            </FieldGroup>
        </div>
        <div class="settings-view-actions">
            <button @click="onSave" class="primary">Save Settings</button>
            <button @click="onReset">Reset</button>
            <button @click="onDefault" class="danger">Reset to Default</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Field from '@render/components/core/Field.vue';
import FieldGroup from '@render/components/core/FieldGroup.vue';
import InputCheckbox from '@render/components/core/InputCheckbox.vue';
import InputField from '@render/components/core/InputField.vue';
import Topbar from '@render/components/layout/Topbar.vue';
import { useAppStore } from '@render/stores/appStore';
import { useImageStore } from '@render/stores/imageStore';
import type { ModalActionCb, ModalDialog } from '@render/stores/modalStore';
import { useModalStore } from '@render/stores/modalStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { useTagStore } from '@render/stores/tagStore';
import { ALLOWED_IMAGE_TYPES } from '@shared/constants.js';
import type { AppSettings } from '@shared/settings';
import { computed, ref, watch } from 'vue';

// --- PROPS & EMITS ---

// --- STORES ---

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const tagStore = useTagStore();
const modalStore = useModalStore();
const imageStore = useImageStore();

// --- STATES ---

// We want no reflection to the settings store
// We use json parse/stringify to create a deep copy. Spread would only create a shallow copy
// Instead structuredClone could be used
const tmpSettings = ref<AppSettings>(JSON.parse(JSON.stringify(settingsStore.settings)));
const tagCollectionNames = computed(() => tagStore.collection.map((tag) => tag.technical_name).join(', '));

// --- COMPUTED ---

// --- WATCHERS ---

// Temporary solution, because otherwise it only works after saving + reloading app.
watch(
    () => settingsStore.settings.app.alwaysOnTop,
    (v: boolean) => {
        appStore.setAlwaysOnTop(v);
    },
);

// --- METHODS ---

const onSave = async () => {
    await settingsStore.assignSettings(tmpSettings.value);
    await settingsStore.persistSettings();
    await settingsStore.loadSettings();
    tmpSettings.value = JSON.parse(JSON.stringify(settingsStore.settings));
};

const onReset = async () => {
    tmpSettings.value = JSON.parse(JSON.stringify(settingsStore.settings));
};

const onDefault = async () => {
    modalStore.setModal({
        title: 'Reset all settings to default',
        description:
            'All settings will be reset to default. This affects only settings. Nothing will be deleted. This action can not be undone.',
        type: 'dialog',
        onConfirm: {
            label: 'Confirm',
            cb: async (): Promise<void> => {
                await settingsStore.setToDefault();
                tmpSettings.value = JSON.parse(JSON.stringify(settingsStore.settings));
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
        onCancel: {
            label: 'Cancel',
            cb: () => {
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
    } as ModalDialog);
};

const onDeleteAllTags = async () => {
    modalStore.setModal({
        title: 'Delete all tags',
        description: 'Are you sure you want to delete all tags? This action can not be undone.',
        type: 'dialog',
        onConfirm: {
            label: 'Confirm',
            cb: async (): Promise<void> => {
                tagStore.collection.forEach(async (tag) => {
                    await tagStore.deleteRecord(tag.id);
                });
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
        onCancel: {
            label: 'Cancel',
            cb: () => {
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
    } as ModalDialog);
};

const onDeleteAllImages = async () => {
    modalStore.setModal({
        title: 'Delete all images',
        description: 'Are you sure you want to delete all images? This action can not be undone.',
        type: 'dialog',
        onConfirm: {
            label: 'Confirm',
            cb: async (): Promise<void> => {
                const iArr = imageStore.collection;
                for (const image of iArr) {
                    await imageStore.deleteImage(image.id);
                }
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
        onCancel: {
            label: 'Cancel',
            cb: () => {
                modalStore.setModal(null);
            },
        } as ModalActionCb<void>,
    } as ModalDialog);
};
</script>

<style scoped lang="scss">
.settings-view {
    padding: 0.5rem;
    margin: 0.25rem 0;
    margin-bottom: 0.5rem;
    padding-bottom: 2rem;

    &-top-bar {
        display: flex;
        align-items: center;
        justify-content: end;
    }

    &-controls {
        padding: 1rem;
        gap: 2rem;
        display: flex;
        flex-direction: column;
    }

    &-actions {
        margin-top: 1rem;
        display: flex;
        flex-direction: row;
        gap: 2rem;
        justify-content: center;

        &-tags {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    }
}
</style>
