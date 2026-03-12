import DatabaseService from '@main/services/DatabaseService.js';
import type { CatalogCategory } from '@shared/types.js';
import { register } from './ipcHandlers.js';

register<{}, CatalogCategory[]>('get-categories-all', async () => {
    const sql = 'SELECT * FROM categories ORDER BY id ASC';
    return (await DatabaseService.getInstance().all(sql)) as CatalogCategory[];
});

register<{ id: string }, CatalogCategory>('get-category', async (event, { id }) => {
    const sql = 'SELECT * FROM categories WHERE id = ? LIMIT 1';
    return (await DatabaseService.getInstance().get(sql, [id])) as CatalogCategory;
});

register<{ displayName: string; technicalName: string }, string>(
    'create-category',
    async (event, { displayName, technicalName }) => {
        const sql = 'INSERT INTO categories (display_name, technical_name) VALUES (?, ?)';
        const lastID = await DatabaseService.getInstance().run(sql, [displayName, technicalName]);
        if (lastID) return lastID.toString() as string;
        else throw new Error('Failed to create category record');
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

register<{ category: CatalogCategory }, void>('update-category', async (event, { category }) => {
    const sql =
        'UPDATE categories SET display_name = ?, technical_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await DatabaseService.getInstance().run(sql, [category.display_name, category.technical_name, category.id]);
});
