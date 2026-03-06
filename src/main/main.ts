import { app, BrowserWindow } from 'electron';
import log from 'electron-log/main.js';
import path from 'path';
import { fileURLToPath } from 'url';
import './ipcHandlers/ipcHandlers.js';
import CleanUpService from './services/CleanUpService.js';
import DatabaseService from './services/DatabaseService.js';
import FileStorageService from './services/FileStorageService.js';
import { LogService } from './services/LogService.js';
import { MigrationService } from './services/MigrationService.js';
import SettingsService from './services/SettingsService.js';
import { UpdateService } from './services/UpdateService.js';

export let mainWindow: BrowserWindow | null = null;
export const isProd = app.isPackaged; // True if the app is packaged

LogService.info(`Application starting in ${isProd ? 'production' : 'development'} mode...`);

const updateService = new UpdateService();
updateService.checkForUpdates();

log.initialize();

const windowSettingsDev: Electron.BrowserWindowConstructorOptions = {
    width: 1600,
    height: 900,
    webPreferences: {
        nodeIntegration: false, // Disables Node.js integration in Render
        contextIsolation: true, // Context-separation between Main and Render
        webSecurity: false, // enforces same-origin policy, CORS... - fails with vite dev server
        preload: path.join(fileURLToPath(import.meta.url), '../../preload', 'preload.js'),
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
        webSecurity: true, // enforce same-origin policy
        preload: path.join(fileURLToPath(import.meta.url), '../../preload', 'preload.js'),
    },
    autoHideMenuBar: true,
    frame: false,
};

const createWindow = async () => {
    try {
        mainWindow = new BrowserWindow(isProd ? windowSettingsProd : windowSettingsDev);
        if (!isProd) {
            await mainWindow.loadURL('http://localhost:5173');
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        } else {
            try {
                await mainWindow.loadFile(path.join(fileURLToPath(import.meta.url), '../../render', 'index.html'));
            } catch (err) {
                LogService.error('Error loading index.html:', err);
            }
        }
    } catch (err) {
        LogService.error('Error creating main window:', err);
        throw err;
    }
};

const initDatabase = async () => {
    try {
        await DatabaseService.getInstance().init(DatabaseService.DB_PATH);
    } catch (err) {
        LogService.error('Error initializing database:', err);
        throw err;
    }
};

const initFilesystem = async () => {
    try {
        const settings = SettingsService.getInstance().getSettings();
        if (!FileStorageService.pathExists(settings.paths.fileDefaultPath)) {
            LogService.warn(`Directory ${settings.paths.fileDefaultPath} does not exist. Creating it now.`);
            FileStorageService.createDir(settings.paths.fileDefaultPath);
        }
        if (!FileStorageService.pathExists(settings.paths.imageDefaultPath)) {
            LogService.warn(`Directory ${settings.paths.imageDefaultPath} does not exist. Creating it now.`);
            FileStorageService.createDir(settings.paths.imageDefaultPath);
        }

        if (!FileStorageService.pathExists(settings.paths.excalidrawDefaultPath)) {
            LogService.warn(`Directory ${settings.paths.excalidrawDefaultPath} does not exist. Creating it now.`);
            FileStorageService.createDir(settings.paths.excalidrawDefaultPath);
        }
    } catch (err) {
        LogService.error('Error initializing filesystem:', err);
        throw err;
    }
};

const initMigrations = async () => {
    try {
        const migrationService = new MigrationService();
        await migrationService.initializeMigrationTable();
        await migrationService.runMigrations();
    } catch (err) {
        LogService.error('Error initializing migrations:', err);
        throw err;
    }
};

app.on('ready', async () => {
    try {
        await initDatabase();
        await initFilesystem();
        await initMigrations();
        await CleanUpService.all();
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

app.on('before-quit', async () => {
    LogService.info('Application is about to quit.');
    await DatabaseService.getInstance().close();
});

// Needed for clean exit on macOS (Cause it doesn't close the app when closing the last window)
app.on('window-all-closed', () => {
    LogService.info('All windows closed.');
    if (process.platform !== 'darwin') app.quit();
});

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
app.on('activate', async (event, hasVisibleWindows: boolean) => {
    LogService.info('App activated.');
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    } else if (mainWindow && !hasVisibleWindows) {
        mainWindow.show();
    }
});
