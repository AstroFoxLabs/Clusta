import { mainWindow } from '../main.js';
import { register } from './ipcHandlers.js';

register<{ alwaysOnTop: boolean }, void>('set-always-on-top', async (event, { alwaysOnTop }) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(alwaysOnTop);
    }
});

register<{}, void>('close-app-window', async () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

register<{}, void>('minimize-app-window', async () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

register<{}, void>('maximize-app-window', async () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize(); // restore from maximized
        } else {
            mainWindow.maximize(); // maximize if normal
        }
    }
});
