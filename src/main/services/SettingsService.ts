import { AppSettings } from '@shared/settings.js';
import electron from 'electron';
import fs from 'fs';
import path from 'path';
import LogService from './LogService.js';

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
        app: electron.app.getAppPath(),
        userData: electron.app.getPath('userData'),
        images: path.join(electron.app.getPath('userData'), 'images'),
        excalidraw: path.join(electron.app.getPath('userData'), 'excalidraw'),
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
            const data = fs.readFileSync(path.join(electron.app.getPath('userData'), 'settings.json'), 'utf-8');
            Object.assign(this.settings, defaultSettings, JSON.parse(data));
        } catch (err) {
            LogService.warn('Can not find Settings file. Using defaults:', err);
            this.settings = { ...defaultSettings };
            this.persistSettings();
        }
        return this.settings;
    }

    persistSettings(): void {
        const settingsPath = path.join(electron.app.getPath('userData'), 'settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 4), 'utf-8');
    }

    getDefaultSettings(): AppSettings {
        return defaultSettings;
    }
}
