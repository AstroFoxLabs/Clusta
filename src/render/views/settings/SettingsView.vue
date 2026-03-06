<template lang="html">
    <Topbar />
    <div class="settings-view">
        <div class="settings-view-controls">
            <FieldGroup title="App Settings" class="field-group">
                <Field label="Always on Top" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.app.alwaysOnTop" />
                </Field>
            </FieldGroup>
            <FieldGroup title="Image Saving Settings" class="field-group">
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
            <FieldGroup title="Excalidraw Settings" class="field-group">
                <Field label="Save Interval (Seconds)" class="field">
                    <InputField v-model.number="tmpSettings.excalidraw.saveIntervalSeconds" min="0" type="number" />
                </Field>
                <Field label="Disable Style Override" class="field">
                    <InputCheckbox type="checkbox" v-model="tmpSettings.excalidraw.disableStyleOverride" />
                </Field>
            </FieldGroup>
            <FieldGroup title="Grid Settings" class="field-group">
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
            <FieldGroup title="Backup Settings (WIP - NOT WORKING YET)" class="field-group">
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
            <FieldGroup title="Clean Up" class="field-group">
                <Field label="Delete all Tags" class="field">
                    <div class="settings-view-actions-tags">
                        <button @click="onDeleteAllTags">Delete All Tags</button>
                        <div>All Current Tags: {{ tagCollectioNames }}</div>
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
import router from '@render/router';
import { useAppStore } from '@render/stores/appStore';
import type { DialogModal, ModalActionCb } from '@render/stores/modalStore';
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

// --- STATES ---

// We want no reflection to the settings store
// We use json parse/stringify to create a deep copy. Spread would only create a shallow copy
// Instead structuredClone could be used
const tmpSettings = ref<AppSettings>(JSON.parse(JSON.stringify(settingsStore.settings)));
const tagCollectioNames = computed(() => tagStore.collection.map((tag) => tag.technical_name).join(', '));

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
    } as DialogModal);
};

const onGoBack = () => {
    router.back();
};

const onDeleteAllTags = async () => {
    modalStore.setModal({
        title: 'Delete all tags',
        description: 'Are you sure you want to delete all tags? This action can not be undone.',
        type: 'dialog',
        onConfirm: {
            label: 'Confirm',
            cb: async (): Promise<void> => {
                try {
                    tagStore.collection.forEach(async (tag) => {
                        await tagStore.deleteRecord(tag.id);
                    });
                } catch (error) {
                    console.error('Error deleting all tags:', error);
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
    } as DialogModal);
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
