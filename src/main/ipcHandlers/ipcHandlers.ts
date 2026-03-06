import { changeObjectsIDType } from '../utils/utils.js';
import type { IpcResponse } from '@shared/types.js';
import { ipcMain } from 'electron';
import { LogService } from '../services/LogService.js';
import './catalogCategoryHandlers.js';
import './catalogImageHandlers.js';
import './catalogTagHandlers.js';
import './excalidrawHandlers.js';
import './settingHandlers.js';
import './utilHandlers.js';
import './windowHandler.js';

type IPCMainHandler<TReq, TRes> = (event: Electron.IpcMainInvokeEvent, req: TReq) => Promise<TRes>;

// Wrapper to simplify error handling for IPC handlers.
// How it works: each handler below calls this function when the module is loaded,
// immediately registering a wrapped handler with ipcMain.handle.
// When a renderer process calls ipcRenderer.invoke(channel),
// Electron executes the registered handler for that channel.
export function register<TReq, TRes>(channel: string, fn: IPCMainHandler<TReq, TRes>) {
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
