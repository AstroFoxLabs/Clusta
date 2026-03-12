import LogService from '@main/services/LogService.js';
import { changeObjectsIDType } from '@main/utils/utils.js';
import type { IpcResponse } from '@shared/types.js';
import electron from 'electron';

// Access `ipcMain` lazily inside `register` to avoid temporal dead zone
// issues when modules import each other during startup.
type IPCMainHandler<TReq, TRes> = (event: Electron.IpcMainInvokeEvent, req: TReq) => Promise<TRes>;

// Wrapper to simplify error handling for IPC handlers.
// Each handler registers themselves with this register function.
// ipcRenderer.invoke(channel) will then call those registered handlers.
export function register<TReq, TRes>(channel: string, fn: IPCMainHandler<TReq, TRes>) {
    const ipcMain = electron.ipcMain;
    ipcMain.handle(channel, async (event, req: TReq): Promise<IpcResponse<TRes>> => {
        try {
            const res = await fn(event, req);
            if (res && typeof res === 'object' && 'id' in res) {
                changeObjectsIDType(res);
            }
            return { success: true, data: res as TRes } as IpcResponse<TRes>;
        } catch (err: any) {
            LogService.error(`Error in IPC handler for channel "${channel}":`, err);
            return {
                success: false,
                error: err?.message ?? 'Unknown error',
            } as IpcResponse<TRes>;
        }
    });
}

// Import handler modules after `register` and `ipcMain` are initialized so
// they can call `register(...)` during their module evaluation without
// triggering a temporal-dead-zone error for `ipcMain`.
import './catalogCategoryHandlers.js';
import './catalogImageHandlers.js';
import './catalogTagHandlers.js';
import './excalidrawHandlers.js';
import './settingHandlers.js';
import './utilHandlers.js';
import './windowHandler.js';
