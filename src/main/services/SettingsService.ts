import { AppSettings } from '@shared/settings.js';
import { app as electron_path } from 'electron';
import fs from 'fs';
import path from 'path';
import { LogService } from './LogService.js';

const defaultSettings: AppSettings = {
    image: {
        conversion: {
            format: 'webp',
            quality: 10,
            lossless: false,
            animated: true,
        },
        maxSizeMB: 15,
    },
    excalidraw: {
        saveIntervalSeconds: 15,
        disableStyleOverride: true,
    },
    grid: {
        disableFilter: false,
        showFavoritesFirst: true,
        showCategoryAll: true,
        showCategoryUncategorized: true,
    },
    backup: {
        enableAutoBackup: false,
        backupIntervalMinutes: 60,
    },
    app: {
        alwaysOnTop: false,
    },
    paths: {
        // get the path of the app
        fileDefaultPath: path.join(electron_path.getPath('userData'), 'files'),
        appDefaultPath: electron_path.getAppPath(),
        imageDefaultPath: path.join(electron_path.getPath('userData'), 'files', 'images'),
        excalidrawDefaultPath: path.join(electron_path.getPath('userData'), 'files', 'excalidraw'),
    },
};

export default class SettingsService {
    private static instance: SettingsService;
    private settings: AppSettings;

    private constructor() {
        this.settings = { ...defaultSettings };
    }

    static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    getSettings(): AppSettings {
        return this.settings;
    }

    assignSettings(partial: Partial<AppSettings>) {
        Object.assign(this.settings, partial);
    }

    loadSettings(): AppSettings {
        try {
            // Create settings file with default settings if it doesn't exist
            if (!fs.existsSync(path.join(electron_path.getPath('userData'), 'files', 'appSettings.json'))) {
                LogService.warn('Settings file does not exist, creating default settings');
                this.settings = { ...defaultSettings };
                this.persistSettings();
                return this.settings;
            }

            const data = fs.readFileSync(
                path.join(electron_path.getPath('userData'), 'files', 'appSettings.json'),
                'utf-8',
            );
            const loadedSettings = JSON.parse(data);
            Object.assign(this.settings, defaultSettings, loadedSettings);
        } catch (err) {
            LogService.error('Error loading settings, using defaults:', err);
            this.settings = { ...defaultSettings };
        }
        return this.settings;
    }

    persistSettings(): void {
        try {
            const settingsPath = path.join(electron_path.getPath('userData'), 'files', 'appSettings.json');
            fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 4), 'utf-8');
            LogService.info('Settings persisted successfully to', settingsPath);
        } catch (err) {
            LogService.error('Error persisting settings:', err);
        }
    }

    getDefaultSettings(): AppSettings {
        LogService.info('Retrieving default settings:', defaultSettings);
        return defaultSettings;
    }
}
