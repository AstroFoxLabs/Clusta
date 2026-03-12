import type {
    CatalogCategory,
    CatalogImage,
    CatalogTag,
    ExcalidrawSceneData,
    ExcalidrawSceneRecord,
    ImageFilePayload,
    IpcResponse,
} from '@shared/types';

export {};

declare global {
    interface Window {
        catalogImage: {
            all: () => Promise<IpcResponse<CatalogImage[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogImage>>;
            create: (name: string, hash: string) => Promise<IpcResponse<string>>;
            update: (image: CatalogImage) => Promise<IpcResponse<void>>;
            persistFile: (payload: ImageFilePayload) => Promise<IpcResponse<ImageFilePayload>>;
            delete: (id: string, onlyRecord?: boolean) => Promise<IpcResponse<void>>;
            getExtension: () => Promise<IpcResponse<string>>;
        };

        catalogCategory: {
            all: () => Promise<IpcResponse<CatalogCategory[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogCategory>>;
            create: (displayName: string, technicalName: string) => Promise<IpcResponse<string>>;
            assignToImage: (imageId: string, categoryId: string) => Promise<IpcResponse<void>>;
            unassignFromImage: (imageId: string, categoryId: string) => Promise<IpcResponse<void>>;
            delete: (categoryId: string) => Promise<IpcResponse<void>>;
            update: (category: CatalogCategory) => Promise<IpcResponse<void>>;
        };

        catalogTag: {
            all: () => Promise<IpcResponse<CatalogTag[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogTag>>;
            create: (technicalName: string) => Promise<IpcResponse<string>>;
            assignToImage: (imageId: string, tagId: string) => Promise<IpcResponse<void>>;
            unassignFromImage: (imageId: string, tagId: string) => Promise<IpcResponse<void>>;
            delete: (tagId: string) => Promise<IpcResponse<void>>;
        };

        excalidraw: {
            allRecords: () => Promise<IpcResponse<ExcalidrawSceneRecord[]>>;
            getRecord: (uuid: string) => Promise<IpcResponse<ExcalidrawSceneRecord>>;
            createRecord: (uuid: string, name: string) => Promise<IpcResponse<UUID>>;
            update: (record: ExcalidrawSceneRecord) => Promise<IpcResponse<void>>;
            deleteRecord: (uuid: string) => Promise<IpcResponse<void>>;
            deleteSceneData: (uuid: string) => Promise<IpcResponse<void>>;
            persistSceneData: (sceneData: ExcalidrawSceneData, uuid: string) => Promise<IpcResponse<void>>;
            getSceneData: (uuid: string) => Promise<IpcResponse<ExcalidrawSceneData>>;
        };
        utils: {
            createBufferHash: (buffer: Uint8Array) => Promise<IpcResponse<string>>;
            createBufferFromFile: (filePath: string) => Promise<IpcResponse<Uint8Array>>;
        };
        settings: {
            loadSettings: () => Promise<IpcResponse<AppSettings>>;
            assignSettings: (newSettings: AppSettings) => Promise<IpcResponse<void>>;
            persistSettings: () => Promise<IpcResponse<void>>;
            setToDefault: () => Promise<IpcResponse<AppSettings>>;
        };
        appWindow: {
            setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<IpcResponse<void>>;
            minimizeToTray: (minimizeToTray: boolean) => Promise<IpcResponse<void>>;
            closeToTray: (closeToTray: boolean) => Promise<IpcResponse<void>>;
            close: () => Promise<IpcResponse<void>>;
            minimize: () => Promise<IpcResponse<void>>;
            maximize: () => Promise<IpcResponse<void>>;
        };
    }
}
