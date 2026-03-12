import type { AppSettings } from '@shared/settings.js';
import type {
    CatalogCategory,
    CatalogImage,
    CatalogTag,
    ExcalidrawSceneData,
    ExcalidrawSceneRecord,
    ImageFilePayload,
    IpcResponse,
    UUID,
} from '@shared/types';
import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded.');

contextBridge.exposeInMainWorld('catalogImage', {
    all: (): Promise<IpcResponse<CatalogImage[]>> => ipcRenderer.invoke('get-catalog-images-all'),
    get: (id: string): Promise<IpcResponse<CatalogImage | null>> => ipcRenderer.invoke('get-catalog-image', { id }),
    create: async (name: string, hash: string): Promise<IpcResponse<string>> => {
        return ipcRenderer.invoke('create-catalog-image', { name, hash });
    },
    persistFile: async (payload: ImageFilePayload): Promise<IpcResponse<ImageFilePayload>> => {
        return ipcRenderer.invoke('persist-image-file', { payload });
    },
    update: (image: CatalogImage): Promise<IpcResponse<void>> => ipcRenderer.invoke('update-catalog-image', { image }),
    delete: (id: string, onlyRecord: boolean = false): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('delete-image', { id, onlyRecord }),
});

contextBridge.exposeInMainWorld('catalogCategory', {
    all: (): Promise<IpcResponse<CatalogCategory[]>> => ipcRenderer.invoke('get-categories-all'),
    get: (id: string): Promise<IpcResponse<CatalogCategory | null>> => ipcRenderer.invoke('get-category', { id }),
    create: (displayName: string, technicalName: string): Promise<IpcResponse<string>> =>
        ipcRenderer.invoke('create-category', { displayName, technicalName }),
    assignToImage: (imageId: string, categoryId: string): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('assign-category-to-image', { imageId, categoryId }),
    unassignFromImage: (imageId: string, categoryId: string): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('unassign-category-from-image', { imageId, categoryId }),
    delete: (id: string, onlyRecord: boolean = false): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('delete-category', { id, onlyRecord }),
    update: (category: CatalogCategory): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('update-category', { category }),
});

contextBridge.exposeInMainWorld('catalogTag', {
    all: (): Promise<IpcResponse<CatalogTag[]>> => ipcRenderer.invoke('get-tags-all'),
    get: (id: string): Promise<IpcResponse<CatalogTag | null>> => ipcRenderer.invoke('get-tag', { id }),
    create: (technicalName: string): Promise<IpcResponse<string>> =>
        ipcRenderer.invoke('create-tag', { technicalName }),
    assignToImage: (imageId: string, tagId: string): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('assign-tag-to-image', { imageId, tagId }),
    unassignFromImage: (imageId: string, tagId: string): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('unassign-tag-from-image', { imageId, tagId }),
    delete: (id: string): Promise<IpcResponse<void>> => ipcRenderer.invoke('delete-tag', { id }),
});

// preload.ts (or wherever you expose APIs)

contextBridge.exposeInMainWorld('excalidraw', {
    allRecords: (): Promise<IpcResponse<ExcalidrawSceneRecord[]>> => ipcRenderer.invoke('get-scene-records-all'),
    getRecord: (uuid: string): Promise<IpcResponse<ExcalidrawSceneRecord>> =>
        ipcRenderer.invoke('get-scene-record', { uuid }),
    createRecord: (uuid: string, name: string): Promise<IpcResponse<UUID>> =>
        ipcRenderer.invoke('create-scene-record', { uuid, name }),
    persistSceneData: (sceneData: ExcalidrawSceneData, uuid: string): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('persist-scene-data', { sceneData, uuid }),
    deleteRecord: (uuid: string): Promise<IpcResponse<void>> => ipcRenderer.invoke('delete-scene-record', { uuid }),
    deleteSceneData: (uuid: string): Promise<IpcResponse<void>> => ipcRenderer.invoke('delete-scene-data', { uuid }),
    getSceneData: (uuid: string): Promise<IpcResponse<ExcalidrawSceneData>> =>
        ipcRenderer.invoke('get-scene-data', { uuid }),
    update: (record: ExcalidrawSceneRecord): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('update-scene-record', { record }),
});

contextBridge.exposeInMainWorld('settings', {
    loadSettings: (): Promise<IpcResponse<AppSettings>> => ipcRenderer.invoke('load-app-settings'),
    assignSettings: (newSettings: AppSettings): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('assign-app-settings', { ...newSettings }),
    persistSettings: (): Promise<IpcResponse<void>> => ipcRenderer.invoke('persist-app-settings'),
    setToDefault: (): Promise<IpcResponse<AppSettings>> => ipcRenderer.invoke('set-default-app-settings'),
});

contextBridge.exposeInMainWorld('utils', {
    createBufferHash: (buffer: Uint8Array): Promise<IpcResponse<string>> =>
        ipcRenderer.invoke('create-buffer-hash', { buffer }),
    createBufferFromFile: (filePath: string): Promise<IpcResponse<Uint8Array>> =>
        ipcRenderer.invoke('create-buffer-from-file', { filePath }),
});

contextBridge.exposeInMainWorld('appWindow', {
    setAlwaysOnTop: (alwaysOnTop: boolean): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('set-always-on-top', { alwaysOnTop }),
    minimizeToTray: (minimizeToTray: boolean): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('set-minimize-to-tray', { minimizeToTray }),
    closeToTray: (closeToTray: boolean): Promise<IpcResponse<void>> =>
        ipcRenderer.invoke('set-close-to-tray', { closeToTray }),
    close: (): Promise<IpcResponse<void>> => ipcRenderer.invoke('close-app-window'),
    minimize: (): Promise<IpcResponse<void>> => ipcRenderer.invoke('minimize-app-window'),
    maximize: (): Promise<IpcResponse<void>> => ipcRenderer.invoke('maximize-app-window'),
});
