import type { AppSettings } from '@shared/settings.js';
import SettingsService from '../services/SettingsService.js';
import { register } from './ipcHandlers.js';

register<{}, AppSettings>('load-app-settings', async () => {
    return SettingsService.getInstance().loadSettings();
});

register<AppSettings, void>('assign-app-settings', async (event, newSettings) => {
    SettingsService.getInstance().assignSettings(newSettings);
});

register<{}, void>('persist-app-settings', async () => {
    SettingsService.getInstance().persistSettings();
});

register<{}, AppSettings>('set-default-app-settings', async () => {
    const settingsInstance = SettingsService.getInstance();
    const defaultSettings = settingsInstance.getDefaultSettings();
    settingsInstance.assignSettings(defaultSettings);
    settingsInstance.persistSettings();
    return defaultSettings;
});
