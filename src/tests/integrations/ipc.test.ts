import type DatabaseService from '@main/services/DatabaseService.js';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import * as os from 'node:os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { CatalogCategory, CatalogImage, CatalogTag, ImageFilePayload, IpcResponse } from '../../shared/types.js';

type IpcHandler = <T>(event: Electron.IpcMainInvokeEvent, args?: any) => Promise<IpcResponse<T>>;
const handlers: Record<string, IpcHandler> = {};

// That is where all test data will be stored temporarily.
const createdTmpDir = mkdtempSync(path.join(os.tmpdir(), 'clusta-test-'));
mkdirSync(path.join(createdTmpDir), { recursive: true });
mkdirSync(path.join(createdTmpDir), { recursive: true });
mkdirSync(path.join(createdTmpDir, 'images'), { recursive: true });
mkdirSync(path.join(createdTmpDir, 'excalidraw'), { recursive: true });

// We don't need update service for tests
vi.mock('../../main/services/UpdateService.js', () => ({
    checkForUpdates: vi.fn(),
}));

vi.mock('../../main/main.js', () => ({
    mainWindow: {}, // Some handlers use the mainWindow
}));

// Mocking Electron's ipcMain to capture handlers
vi.mock('electron', async () => ({
    default: {
        ipcMain: {
            handle: vi.fn((channel: string, handler: IpcHandler) => {
                handlers[channel] = handler;
            }),
        },
        // For the paths in SettingsService
        app: {
            getPath: vi.fn(() => createdTmpDir),
            getAppPath: vi.fn(() => createdTmpDir),
        },
    },
}));

let ipcMainInvokeEvent: Electron.IpcMainInvokeEvent = {} as Electron.IpcMainInvokeEvent;

// Mock the test image file
const mockImagePath = path.join(__dirname, '../', 'mock_data', 'image.jpg');
const readFile = readFileSync(mockImagePath);
const imageBuffer = new Uint8Array(readFile);

const defaultSettings = {
    image: {
        conversion: {
            format: 'webp',
            quality: 10,
            lossless: false,
            animated: true,
        },
        maxSizeMB: 15,
    },
    excalidraw: {
        saveIntervalSeconds: 15,
        disableStyleOverride: true,
    },
    grid: {
        disableFilter: false,
        showFavoritesFirst: true,
        showCategoryAll: true,
        showCategoryUncategorized: true,
    },
    backup: {
        enableAutoBackup: false,
        backupIntervalMinutes: 60,
    },
    app: {
        alwaysOnTop: false,
    },
    paths: {
        app: '/',
        root: path.join(createdTmpDir),
        userData: createdTmpDir,
        images: path.join(createdTmpDir, 'images'),
        excalidraw: path.join(createdTmpDir, 'excalidraw'),
    },
};

// Use the mocked settings in this test file
vi.mock('../../main/services/SettingsService.js', () => ({
    default: {
        getInstance: () => ({
            getSettings: () => defaultSettings,
            loadSettings: () => defaultSettings,
        }),
    },
}));

const fakeCatalogImage: CatalogImage = {
    id: '1',
    name: 'image.jpg',
    hash: 'fakehash123',
    tags: [],
    categories: [],
    is_favorite: false,
    added_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const fakeImageFilePayload: ImageFilePayload = {
    name: 'image.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    data: imageBuffer,
    hash: 'fakehash123',
};

const fakeCatalogCategory: CatalogCategory = {
    id: '1',
    display_name: 'Category 1',
    technical_name: 'category_1',
};

const fakeCatalogTag: CatalogTag = {
    id: '1',
    technical_name: 'tag_1',
};

async function importIpcModule() {
    await import('../../main/ipcHandlers/ipcHandlers.js');
}

let dbService: DatabaseService;
const dbPath = ':memory:'; // Using in-memory database for tests, so we don't have to worry about cleanup.
async function createTempDatabase(): Promise<void> {
    await dbService.init(dbPath);
    const schemaPath = path.join(__dirname, '../db_schema/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    await dbService.exec(schema);
    // Verify that tables are created
    await dbService.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
}

describe('IPC Integration Tests', () => {
    beforeAll(async () => {
        vi.resetModules();
        // Late import because vi.resetModules() is used to clear the module cache, and we want to ensure that the mocked modules are in place before importing the IPC handlers.
        const module = await import('../../main/services/DatabaseService.js');
        dbService = module.default.getInstance();

        await createTempDatabase();
        await importIpcModule();
    });

    afterAll(async () => {
        try {
            dbService.db?.run('DELETE FROM images');
            dbService.db?.run('DELETE FROM categories');
            dbService.db?.run('DELETE FROM tags');
        } catch (err) {
            console.error(err);
        }
        await dbService.close();
        if (createdTmpDir) {
            await rm(createdTmpDir, { recursive: true, force: true });
        }
    });

    it('Storing Fake Image File', async () => {
        const handler = handlers['persist-image-file'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            payload: fakeImageFilePayload,
        });
        console.log('Response from persist-image-file handler:', res);
        expect(res.success).toBe(true);
        expect(res.data).toEqual(fakeImageFilePayload);
    });

    it('Creating Image Record in Database', async () => {
        const handler = handlers['create-catalog-image'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            name: fakeCatalogImage.name,
            hash: fakeCatalogImage.hash,
        });
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
    });

    it('Creating Fake Category', async () => {
        const handler = handlers['create-category'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            displayName: fakeCatalogCategory.display_name,
            technicalName: fakeCatalogCategory.technical_name,
        });
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
    });

    it('Checking Existence of Created Category', async () => {
        const handler = handlers['get-category'];
        let res: IpcResponse<CatalogCategory> = (await handler(ipcMainInvokeEvent, {
            id: fakeCatalogCategory.id,
        })) as IpcResponse<CatalogCategory>;
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data).toEqual(fakeCatalogCategory);
        }
    });

    it('Creating Fake Tag', async () => {
        const handler = handlers['create-tag'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            technicalName: fakeCatalogTag.technical_name,
        });
        expect(res.success).toBe(true);
    });

    it('Checking Existence of Created Tag', async () => {
        const handler = handlers['get-tag'];
        const res: IpcResponse<CatalogTag> = (await handler(ipcMainInvokeEvent, {
            id: fakeCatalogTag.id,
        })) as IpcResponse<CatalogTag>;
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data).toEqual(fakeCatalogTag);
        }
    });

    it('Assigning Category to Image', async () => {
        const handler = handlers['assign-category-to-image'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            imageId: fakeCatalogImage.id,
            categoryId: fakeCatalogCategory.id,
        });
        expect(res.success).toBe(true);
    });

    it('Assigning Tag to Image', async () => {
        const handler = handlers['assign-tag-to-image'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            imageId: fakeCatalogImage.id,
            tagId: fakeCatalogTag.id,
        });
        expect(res.success).toBe(true);
    });

    it('Fetching Image with Metadata', async () => {
        const handler = handlers['get-catalog-image'];
        let res: IpcResponse<CatalogImage> = (await handler(ipcMainInvokeEvent, {
            id: fakeCatalogImage.id,
        })) as IpcResponse<CatalogImage>;
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data).toBeDefined();
            expect(res.data.categories).toBeDefined();
            expect(res.data.tags).toBeDefined();
            expect(res.data.categories?.length).toBe(1);
            expect(res.data.tags?.length).toBe(1);
            expect(res.data.categories![0]).toEqual(fakeCatalogCategory);
            expect(res.data.tags![0]).toEqual(fakeCatalogTag);
            expect(res.data.is_favorite).toBe(false);
        }
    });

    it('Fetching All Images', async () => {
        const handler = handlers['get-catalog-images-all'];
        let res: IpcResponse<CatalogImage[]> = await handler(ipcMainInvokeEvent);
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);
    });

    it('Fetching All Categories', async () => {
        const handler = handlers['get-categories-all'];
        let res: IpcResponse<CatalogCategory[]> = await handler(ipcMainInvokeEvent);
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);
    });

    it('Fetching All Tags', async () => {
        const handler = handlers['get-tags-all'];
        let res: IpcResponse<CatalogTag[]> = await handler(ipcMainInvokeEvent);
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);
    });

    it('Removing Category from Image', async () => {
        const handler = handlers['unassign-category-from-image'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            imageId: fakeCatalogImage.id,
            categoryId: fakeCatalogCategory.id,
        });
        expect(res.success).toBe(true);
    });

    it('Removing Tag from Image', async () => {
        const handler = handlers['unassign-tag-from-image'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            imageId: fakeCatalogImage.id,
            tagId: fakeCatalogTag.id,
        });
        expect(res.success).toBe(true);
    });

    it('Updating Image Data', async () => {
        const newName = 'updated_image.jpg';
        const handler = handlers['update-catalog-image'];
        console.log('Image in Test', fakeCatalogImage);
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            image: { ...fakeCatalogImage, name: newName },
        });
        expect(res.success).toBe(true);
    });

    it('Checking Updated Image Name', async () => {
        const handler = handlers['get-catalog-image'];
        let res: IpcResponse<CatalogImage> = await handler(ipcMainInvokeEvent, {
            id: fakeCatalogImage.id,
        });
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
        expect(res.data.name).toBe('updated_image.jpg');
    });

    it('Deleting Image', async () => {
        const handlerDelete = handlers['delete-image'];
        let res: IpcResponse<void> = await handlerDelete(ipcMainInvokeEvent, {
            id: fakeCatalogImage.id,
        });
        expect(res.success).toBe(true);
    });

    it('Deleting Category', async () => {
        const handler = handlers['delete-category'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            categoryId: fakeCatalogCategory.id,
        });
        expect(res.success).toBe(true);
    });

    it('Deleting Tag', async () => {
        const handler = handlers['delete-tag'];
        let res: IpcResponse<void> = await handler(ipcMainInvokeEvent, {
            tagId: fakeCatalogTag.id,
        });
        expect(res.success).toBe(true);
    });
});
