import electron from 'electron';
import { autoUpdater, type AppUpdater } from 'electron-updater';
import path from 'path';
import LogService from './LogService.js';

const { dialog, app } = electron;

export function getAutoUpdater(): AppUpdater {
    return autoUpdater;
}

function isPortable() {
    const exePath = app.getPath('exe');
    const exeDir = path.dirname(exePath).toLowerCase();

    if (process.platform === 'win32') {
        return !(exeDir.includes('program files') || exeDir.includes('appdata'));
    } else if (process.platform === 'linux') {
        return !(exeDir.startsWith('/usr') || exeDir.startsWith('/opt'));
    } else if (process.platform === 'darwin') {
        return !exeDir.startsWith('/Applications');
    }
    return false;
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

            if (!isPortable()) {
                const choice = dialog.showMessageBoxSync({
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Update Ready',
                    message: `Version ${info.version} is available. Update now?`,
                } as Electron.MessageBoxOptions);

                if (choice === 0) {
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Update Available',
                        message: `Version ${info.version} is available. Downloading now...`,
                    } as Electron.MessageBoxOptions);
                }
            } else {
                LogService.info('Running in portable mode - skipping update prompt and download.');
            }
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
