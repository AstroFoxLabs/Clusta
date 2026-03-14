import electron from 'electron';
import { autoUpdater, type AppUpdater } from 'electron-updater';
import LogService from './LogService.js';

const { dialog } = electron;

export function getAutoUpdater(): AppUpdater {
    return autoUpdater;
}

export default class UpdateService {
    constructor() {
        this.registerAutoUpdaterEvents();
    }

    private registerAutoUpdaterEvents() {
        LogService.info('Registering auto-updater events...');

        const autoUpdater = getAutoUpdater();
        autoUpdater.logger = console;

        autoUpdater.on('checking-for-update', () => {
            LogService.info('Checking for updates...');
        });

        autoUpdater.on('update-available', (info) => {
            LogService.info('Update available:', info.version);
            dialog.showMessageBox({
                type: 'info',
                title: 'Update Available',
                message: `Version ${info.version} is available. Downloading now...`,
            } as Electron.MessageBoxOptions);
        });

        autoUpdater.on('update-not-available', (info) => {
            LogService.info('No updates available');
        });

        autoUpdater.on('error', (err) => {
            LogService.error('Auto-updater error:', err);
        });

        autoUpdater.on('download-progress', (progress) => {
            const percent = Math.round(progress.percent);
            LogService.info(`Download progress: ${percent}%`);
            // TODO: Send progress to renderer via IPC
        });

        autoUpdater.on('update-downloaded', (info) => {
            LogService.info('Update downloaded:', info.version);
            const choice = dialog.showMessageBoxSync({
                type: 'question',
                buttons: ['Restart Now', 'Later'],
                title: 'Update Ready',
                message: `Version ${info.version} has been downloaded. Restart to apply the update?`,
            });
            if (choice === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    }

    async checkForUpdates() {
        const autoUpdater = getAutoUpdater();
        await autoUpdater.checkForUpdatesAndNotify();
    }
}
