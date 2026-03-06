import type {
    IpcResponse,
    CatalogImage,
    CatalogCategory,
    CatalogTag,
    ImageFilePayload,
    ExcalidrawScene,
    ExcalidrawSceneData,
    ExcalidrawSceneRecord,
} from '@shared/types';

export {};

declare global {
    interface Window {
        catalogImage: {
            all: () => Promise<IpcResponse<CatalogImage[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogImage | null>>;
            create: (name: string, hash: string) => Promise<IpcResponse<CatalogImage>>;
            persistFile: (payload: ImageFilePayload) => Promise<IpcResponse<ImageFilePayload>>;
            updateName: (imageId: string, newName: string) => Promise<IpcResponse<void>>;
            updateFavorite: (imageId: string, isFavorite: boolean) => Promise<IpcResponse<void>>;
            delete: (id: string, onlyRecord?: boolean) => Promise<IpcResponse<void>>;
            getExtension: () => Promise<IpcResponse<string>>;
        };

        catalogCategory: {
            all: () => Promise<IpcResponse<CatalogCategory[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogCategory | null>>;
            create: (displayName: string, technicalName: string) => Promise<IpcResponse<CatalogCategory>>;
            assignToImage: (imageId: string, categoryId: string) => Promise<IpcResponse<void>>;
            unassignFromImage: (imageId: string, categoryId: string) => Promise<IpcResponse<void>>;
            delete: (categoryId: string) => Promise<IpcResponse<void>>;
            updateName: (categoryId: string, displayName: string, technicalName: string) => Promise<IpcResponse<void>>;
        };

        catalogTag: {
            all: () => Promise<IpcResponse<CatalogTag[]>>;
            get: (id: string) => Promise<IpcResponse<CatalogTag | null>>;
            create: (technicalName: string) => Promise<IpcResponse<CatalogTag>>;
            assignToImage: (imageId: string, tagId: string) => Promise<IpcResponse<void>>;
            unassignFromImage: (imageId: string, tagId: string) => Promise<IpcResponse<void>>;
            delete: (tagId: string) => Promise<IpcResponse<void>>;
        };

        excalidraw: {
            allRecords: () => Promise<IpcResponse<ExcalidrawSceneRecord[]>>;
            getRecord: (uuid: string) => Promise<IpcResponse<ExcalidrawSceneRecord | null>>;
            getLatestRecord: () => Promise<IpcResponse<ExcalidrawSceneRecord | null>>;
            createRecord: (uuid: string, name: string) => Promise<IpcResponse<ExcalidrawSceneRecord>>;
            updateRecordName: (uuid: string, name: string) => Promise<IpcResponse<void>>;
            deleteRecord: (uuid: string) => Promise<IpcResponse<void>>;
            deleteSceneData: (uuid: string) => Promise<IpcResponse<void>>;
            persistSceneData: (
                sceneData: ExcalidrawSceneData,
                uuid: string,
            ) => Promise<IpcResponse<ExcalidrawSceneData>>;
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
