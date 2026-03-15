import '@main/ipcHandlers/ipcHandlers.js';
import CleanUpService from '@main/services/CleanUpService.js';
import DatabaseService from '@main/services/DatabaseService.js';
import FileStorageService from '@main/services/FileStorageService.js';
import LogService from '@main/services/LogService.js';
import MigrationService from '@main/services/MigrationService.js';
import SettingsService from '@main/services/SettingsService.js';
import UpdateService from '@main/services/UpdateService.js';
import dotenv from 'dotenv';
import electron from 'electron';
import Logger from 'electron-log/main.js';
import path from 'path';

const { app, BrowserWindow } = electron;

export let mainWindow: electron.BrowserWindow | null = null;

dotenv.config();
Logger.initialize();

LogService.clearLogFile();

const windowSettingsDev: Electron.BrowserWindowConstructorOptions = {
    width: 1600,
    height: 900,
    webPreferences: {
        nodeIntegration: false, // Disables Node.js integration in Render
        contextIsolation: true, // Context-separation between Main and Render
        webSecurity: false, // enforces same-origin policy, CORS... - fails with vite dev server
        preload: path.join(__dirname, '../preload', 'preload.js'),
    },
    autoHideMenuBar: true,
    frame: false,
};

const windowSettingsProd: Electron.BrowserWindowConstructorOptions = {
    width: 1600,
    height: 900,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true, // enforce same-origin policy / works only with file:// protocol, so it works in production
        preload: path.join(__dirname, '../preload', 'preload.js'),
    },
    autoHideMenuBar: true,
    frame: false,
};

const createWindow = async () => {
    mainWindow = new BrowserWindow(app.isPackaged ? windowSettingsProd : windowSettingsDev);
    if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL && process.env.NODE_ENV === 'development') {
        LogService.info('Loading development server at', process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
        await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        LogService.info('Loading production build');
        await mainWindow.loadFile(path.join(__dirname, '../render/index.html'));
    }
};

const initDatabase = async () => {
    await DatabaseService.getInstance().init(DatabaseService.DB_PATH);
};

const initFilesystem = async () => {
    const settings = SettingsService.getInstance().getSettings();
    if (!FileStorageService.pathExists(settings.paths.images)) {
        LogService.warn(`Directory ${settings.paths.images} does not exist. Creating it now.`);
        FileStorageService.copyDir(path.join(process.resourcesPath, 'defaults/images'), settings.paths.images);
    }

    if (!FileStorageService.pathExists(settings.paths.excalidraw)) {
        LogService.warn(`Directory ${settings.paths.excalidraw} does not exist. Creating it now.`);
        FileStorageService.copyDir(path.join(process.resourcesPath, 'defaults/excalidraw'), settings.paths.excalidraw);
    }
};

const initMigrations = async () => {
    const migrationService = new MigrationService();
    await migrationService.initializeMigrationTable();
    await migrationService.runMigrations();
};

const initCleanUp = async () => {
    await CleanUpService.removeOrphaned(
        'images',
        'id',
        `${SettingsService.getInstance().getSettings().paths.images}`,
        'webp',
        'hash',
    );
    await CleanUpService.removeOrphaned(
        'excalidraw_scenes',
        'uuid',
        `${SettingsService.getInstance().getSettings().paths.excalidraw}`,
        'excalidraw',
        'uuid',
    );
};

app.on('ready', async () => {
    const updateService = new UpdateService();
    try {
        try {
            await updateService.checkForUpdates();
        } catch (err) {
            LogService.error('Failed to check for updates. Skipping.', err);
        }
        await initDatabase();
        await initFilesystem();
        await initMigrations();
        await initCleanUp();
        await createWindow();
    } catch (err) {
        LogService.error('Failed to initialize application:', err);
        app.quit();
    }
});

// Important: Will not be emitted on Windows, when app closes through shutdown/restart or logout
app.on('quit', () => {
    LogService.info('Application is quitting.');
});

// Needed for clean exit on macOS (Cause it doesn't close the app when closing the last window)
app.on('window-all-closed', () => {
    LogService.info('All windows closed.');
    if (process.platform !== 'darwin') app.quit();
});

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
app.on('activate', async (event, hasVisibleWindows: boolean) => {
    try {
        if (BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        } else if (mainWindow && !hasVisibleWindows) {
            mainWindow.show();
        }
    } catch (err) {
        LogService.error('Failed to create window on activate:', err);
    }
});
