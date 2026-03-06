import type { CatalogTag } from '@shared/types.js';
import DatabaseService from '../services/DatabaseService.js';
import { register } from './ipcHandlers.js';

register<{}, CatalogTag[]>('get-tags-all', async () => {
    const sql = 'SELECT * FROM tags ORDER BY id DESC';
    return (await DatabaseService.getInstance().all(sql, {})) as CatalogTag[];
});

register<{ id: string }, CatalogTag | null>('get-tag', async (event, { id }) => {
    const sql = 'SELECT * FROM tags WHERE id = ? LIMIT 1';
    const row = (await DatabaseService.getInstance().get(sql, [id])) as CatalogTag;
    if (!row) {
        return null;
    }
    return row;
});

register<{ technicalName: string }, CatalogTag>('create-tag', async (event, { technicalName }) => {
    const sql = 'INSERT INTO tags (technical_name) VALUES (?)';
    await DatabaseService.getInstance().run(sql, [technicalName]);

    const recordSql = 'SELECT * FROM tags WHERE technical_name = ? LIMIT 1';
    return (await DatabaseService.getInstance().get(recordSql, [technicalName])) as CatalogTag;
});

register<{ imageId: string; tagId: string }, void>('assign-tag-to-image', async (event, { imageId, tagId }) => {
    const sql = 'INSERT INTO images_tags (image_id, tag_id) VALUES (?, ?)';
    await DatabaseService.getInstance().run(sql, [imageId, tagId]);
});

register<{ imageId: string; tagId: string }, void>('unassign-tag-from-image', async (event, { imageId, tagId }) => {
    const sql = 'DELETE FROM images_tags WHERE image_id = ? AND tag_id = ?';
    await DatabaseService.getInstance().run(sql, [imageId, tagId]);
});

register<{ id: string }, void>('delete-tag', async (event, { id }) => {
    const sql = 'DELETE FROM tags WHERE id = ?';
    await DatabaseService.getInstance().run(sql, [id]);
});
