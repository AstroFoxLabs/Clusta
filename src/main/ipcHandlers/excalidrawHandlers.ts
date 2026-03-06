import { register } from './ipcHandlers.js';
import DatabaseService from '../services/DatabaseService.js';
import FileStorageService from '../services/FileStorageService.js';
import type { ExcalidrawSceneData, ExcalidrawSceneRecord, ImageExtension } from '@shared/types.js';

register<{}, ExcalidrawSceneRecord[]>('get-scene-records-all', async () => {
    const sql = `
        SELECT *
        FROM excalidraw_scenes
        ORDER BY updated_at ASC
    `;
    return (await DatabaseService.getInstance().all(sql, {})) as ExcalidrawSceneRecord[];
});

register<{ uuid: string }, ExcalidrawSceneData>('get-scene-data', async (event, { uuid }) => {
    return (await FileStorageService.getFileAsJSON('excalidraw', `${uuid}.excalidraw`)) as ExcalidrawSceneData;
});

register<{ uuid: string }, ExcalidrawSceneRecord | null>('get-scene-record', async (event, { uuid }) => {
    const sql = `
        SELECT *
        FROM excalidraw_scenes
        WHERE uuid = ?
        LIMIT 1
    `;
    return (await DatabaseService.getInstance().get(sql, [uuid])) as ExcalidrawSceneRecord | null;
});

register<{ uuid: string }, void>('delete-scene-data', async (event, { uuid }) => {
    FileStorageService.delete(`${uuid}.excalidraw`, 'excalidraw');
});

register<{ uuid: string; name: string }, ExcalidrawSceneRecord>(
    'create-scene-record',
    async (event, { uuid, name }) => {
        const sql = `INSERT INTO excalidraw_scenes (uuid, name) VALUES (?, ?);`;
        await DatabaseService.getInstance().run(sql, [uuid, name]);

        const recordSql = `SELECT * FROM excalidraw_scenes WHERE uuid = ? LIMIT 1;`;
        return (await DatabaseService.getInstance().get(recordSql, [uuid])) as ExcalidrawSceneRecord;
    },
);

register<{ sceneData: ExcalidrawSceneData; uuid: string }, ExcalidrawSceneData>(
    'persist-scene-data',
    async (event, { sceneData, uuid }) => {
        if (!sceneData.appState) {
            throw new Error('Invalid scene data');
        }
        const fileName = `${uuid}.excalidraw`;
        const buffer = Buffer.from(JSON.stringify(sceneData), 'utf-8');
        await FileStorageService.store(fileName, buffer, 'excalidraw');

        const res = (await FileStorageService.getFileAsJSON('excalidraw', fileName)) as ExcalidrawSceneData;

        if (!res) {
            throw new Error('Scene data not found');
        }

        return res;
    },
);

register<{ uuid: string }, void>('delete-scene-record', async (event, { uuid }) => {
    const sql = `DELETE FROM excalidraw_scenes WHERE uuid = ?`;
    await DatabaseService.getInstance().run(sql, [uuid]);
});

register<{ uuid: string; name: string }, void>('update-scene-record-name', async (event, { uuid, name }) => {
    const sql = `UPDATE excalidraw_scenes SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?`;
    await DatabaseService.getInstance().run(sql, [name, uuid]);
});

register<{}, ExcalidrawSceneRecord | null>('get-latest-scene-record', async () => {
    const sql = `
        SELECT *
        FROM excalidraw_scenes
        ORDER BY id DESC
        LIMIT 1
    `;
    return (await DatabaseService.getInstance().get(sql, {})) as ExcalidrawSceneRecord | null;
});
