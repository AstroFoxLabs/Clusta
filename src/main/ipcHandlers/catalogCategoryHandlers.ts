import { register } from './ipcHandlers.js';
import DatabaseService from '../services/DatabaseService.js';
import type { CatalogCategory } from '@shared/types.js';

register<{}, CatalogCategory[]>('get-categories-all', async () => {
    const sql = 'SELECT * FROM categories ORDER BY id ASC';
    const rows = (await DatabaseService.getInstance().all(sql, {})) as CatalogCategory[];
    return rows;
});

register<{ id: string }, CatalogCategory | null>('get-category', async (event, { id }) => {
    const sql = 'SELECT * FROM categories WHERE id = ? LIMIT 1';
    const row = (await DatabaseService.getInstance().get(sql, [id])) as CatalogCategory;
    if (!row) {
        return null;
    }
    return row;
});

register<{ displayName: string; technicalName: string }, CatalogCategory>(
    'create-category',
    async (event, { displayName, technicalName }) => {
        const sql = 'INSERT INTO categories (display_name, technical_name) VALUES (?, ?)';
        await DatabaseService.getInstance().run(sql, [displayName, technicalName]);

        const recordSql = 'SELECT * FROM categories WHERE technical_name = ? LIMIT 1';
        return (await DatabaseService.getInstance().get(recordSql, [technicalName])) as CatalogCategory;
    },
);

register<{ imageId: string; categoryId: string }, void>(
    'assign-category-to-image',
    async (event, { imageId, categoryId }) => {
        const sql = 'INSERT INTO images_categories (image_id, category_id) VALUES (?, ?)';
        await DatabaseService.getInstance().run(sql, [imageId, categoryId]);
    },
);

register<{ imageId: string; categoryId: string }, void>(
    'unassign-category-from-image',
    async (event, { imageId, categoryId }) => {
        const sql = 'DELETE FROM images_categories WHERE image_id = ? AND category_id = ?';
        await DatabaseService.getInstance().run(sql, [imageId, categoryId]);
    },
);

register<{ id: string }, void>('delete-category', async (event, { id }) => {
    const sql = 'DELETE FROM categories WHERE id = ?';
    await DatabaseService.getInstance().run(sql, [id]);
});

register<{ categoryId: string; displayName: string; technicalName: string }, void>(
    'update-category-name',
    async (event, { categoryId, displayName, technicalName }) => {
        const sql = `UPDATE categories SET display_name = ?, technical_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await DatabaseService.getInstance().run(sql, [displayName, technicalName, categoryId]);
    },
);
