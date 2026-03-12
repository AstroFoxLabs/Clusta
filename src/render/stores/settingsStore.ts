import { ipcAPI } from '@render/services/ipcAPIService';
import type { AppSettings } from '@shared/settings';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotificationStore } from './notificationStore';

export const useSettingsStore = defineStore('settings', () => {
    /* ---------------------------- STORES ---------------------------- */

    const notificationStore = useNotificationStore();

    // Type Fix so that typescript knows that settings will be assigned definitely later
    const settings = ref<AppSettings>(null as unknown as AppSettings);

    /* ---------------------------- STATES ---------------------------- */

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    /* ----------------------------- ACTIONS ------------------------- */

    const loadSettings = async (): Promise<AppSettings> => {
        try {
            const res = await ipcAPI<AppSettings>(() => window.settings.loadSettings());
            settings.value = res;
            return settings.value;
        } catch (error) {
            notificationStore.addEventMessage('Failed to load settings');
            console.error('Error loading settings:', error);
            throw error;
        }
    };

    const assignSettings = async (newSettings: AppSettings): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.settings.assignSettings(JSON.parse(JSON.stringify(newSettings))));
            settings.value = newSettings;
        } catch (error) {
            notificationStore.addEventMessage('Failed to assign settings');
            console.error('Error assigning settings:', error);
            throw error;
        }
    };

    // Persists the settings that were last pushed to the main process via assignSettings.
    const persistSettings = async (): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.settings.persistSettings());
        } catch (error) {
            notificationStore.addEventMessage('Failed to persist settings');
            console.error('Error persisting settings:', error);
            throw error;
        }
    };

    const setToDefault = async (): Promise<void> => {
        try {
            const defaultSettings = await ipcAPI<AppSettings>(() => window.settings.setToDefault());
            settings.value = defaultSettings;
        } catch (error) {
            notificationStore.addEventMessage('Failed to set settings to default');
            console.error('Error setting settings to default:', error);
            throw error;
        }
    };

    return {
        settings,
        loadSettings,
        assignSettings,
        persistSettings,
        setToDefault,
    };
});
