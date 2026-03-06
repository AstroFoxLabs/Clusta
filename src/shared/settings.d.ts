export interface AppSettings {
    image: {
        conversion: {
            format: 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'avif' | 'tiff' | 'tif' | 'svg';
            quality: number;
            lossless: boolean;
            animated: boolean;
        };
        maxSizeMB: number;
    };
    excalidraw: {
        saveIntervalSeconds: number;
        disableStyleOverride: boolean;
    };
    grid: {
        disableFilter: boolean;
        showFavoritesFirst: boolean;
        showCategoryAll: boolean;
        showCategoryUncategorized: boolean;
    };
    backup: {
        enableAutoBackup: boolean;
        backupIntervalMinutes: number;
    };
    app: {
        alwaysOnTop: boolean;
    };
    paths: {
        fileDefaultPath: string;
        appDefaultPath: string;
        imageDefaultPath: string;
        excalidrawDefaultPath: string;
    };
}
