import DatabaseService from '@main/services/DatabaseService.js';
import FileStorageService from '@main/services/FileStorageService.js';
import type { ExcalidrawSceneData, ExcalidrawSceneRecord, UUID } from '@shared/types.js';
import { register } from './ipcHandlers.js';

register<{}, ExcalidrawSceneRecord[]>('get-scene-records-all', async () => {
    const sql = `
        SELECT *
        FROM excalidraw_scenes
        ORDER BY updated_at ASC
    `;
    return (await DatabaseService.getInstance().all(sql)) as ExcalidrawSceneRecord[];
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
    const res = (await DatabaseService.getInstance().get(sql, [uuid])) as ExcalidrawSceneRecord;
    return res;
});

register<{ uuid: string }, void>('delete-scene-data', async (event, { uuid }) => {
    FileStorageService.delete(`${uuid}.excalidraw`, 'excalidraw');
});

register<{ uuid: string; name: string }, UUID>('create-scene-record', async (event, { uuid, name }) => {
    const sql = `INSERT INTO excalidraw_scenes (uuid, name) VALUES (?, ?);`;
    await DatabaseService.getInstance().run(sql, [uuid, name]);
    return uuid;
});

register<{ sceneData: ExcalidrawSceneData; uuid: string }, void>(
    'persist-scene-data',
    async (event, { sceneData, uuid }) => {
        if (!sceneData.appState) {
            throw new Error('Appstate is missing in the provided scene data');
        }
        const fileName = `${uuid}.excalidraw`;
        const buffer = Buffer.from(JSON.stringify(sceneData), 'utf-8');
        FileStorageService.store(fileName, buffer, 'excalidraw');
    },
);

register<{ uuid: string }, void>('delete-scene-record', async (event, { uuid }) => {
    const sql = `DELETE FROM excalidraw_scenes WHERE uuid = ?`;
    await DatabaseService.getInstance().run(sql, [uuid]);
});

register<{ record: ExcalidrawSceneRecord }, void>('update-scene-record', async (event, { record }) => {
    const sql = `UPDATE excalidraw_scenes SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?`;
    await DatabaseService.getInstance().run(sql, [record.name, record.uuid]);
});

register<{}, ExcalidrawSceneRecord>('get-latest-scene-record', async () => {
    const sql = `
        SELECT *
        FROM excalidraw_scenes
        ORDER BY id DESC
        LIMIT 1
    `;
    return (await DatabaseService.getInstance().get(sql, {})) as ExcalidrawSceneRecord;
});
