import { CatalogImage, ImageFilePayload } from '@shared/types.js';
import DatabaseService from '../services/DatabaseService.js';
import FileStorageService from '../services/FileStorageService.js';
import ImageConversionService from '../services/ImageConversionService.js';
import ValidationService from '../services/ValidationService.js';
import { register } from './ipcHandlers.js';

register<{}, CatalogImage[]>('get-catalog-images-all', async () => {
    // json_group_array is a feature of SQLite that aggregates rows into a JSON array
    const sql = `
        SELECT
            i.id,
            i.hash,
            i.name,
            i.is_favorite,
            i.added_at,
            i.updated_at,
            COALESCE(t.tags_json, '[]') AS tags_json,
            COALESCE(c.categories_json, '[]') AS categories_json
        FROM images i
        LEFT JOIN (
            SELECT
                it.image_id,
                json_group_array(
                    json_object(
                        'id', t.id,
                        'technical_name', t.technical_name
                    )
                ) AS tags_json
            FROM images_tags it
            JOIN tags t ON t.id = it.tag_id
            GROUP BY it.image_id
        ) t ON t.image_id = i.id
        LEFT JOIN (
            SELECT
                ic.image_id,
                json_group_array(
                    json_object(
                        'id', c.id,
                        'technical_name', c.technical_name,
                        'display_name', c.display_name
                    )
                ) AS categories_json
            FROM images_categories ic
            JOIN categories c ON c.id = ic.category_id
            GROUP BY ic.image_id
        ) c ON c.image_id = i.id
        ORDER BY i.added_at DESC;
    `;

    const rows = await DatabaseService.getInstance().all(sql, {});

    if (!rows || rows.length === 0) {
        return [] as CatalogImage[];
    }

    const images: CatalogImage[] = rows.map((row: any) => ({
        id: row.id,
        hash: row.hash,
        name: row.name,
        tags: JSON.parse(row.tags_json),
        categories: JSON.parse(row.categories_json),
        added_at: row.added_at,
        updated_at: row.updated_at,
        is_favorite: row.is_favorite === 1,
    }));

    return images;
});

register<{ id: string }, CatalogImage | null>('get-catalog-image', async (event, { id }) => {
    const sql = `
            SELECT
                i.id,
                i.hash,
                i.name,
                i.is_favorite,
                i.added_at,
                i.updated_at,
                COALESCE(t.tags_json, '[]') AS tags_json,
                COALESCE(c.categories_json, '[]') AS categories_json
            FROM images i

            LEFT JOIN (
                SELECT
                    it.image_id,
                    json_group_array(
                        json_object(
                            'id', t.id,
                            'technical_name', t.technical_name
                        )
                    ) AS tags_json
                FROM images_tags it
                JOIN tags t ON t.id = it.tag_id
                GROUP BY it.image_id
            ) t ON t.image_id = i.id

            LEFT JOIN (
                SELECT
                    ic.image_id,
                    json_group_array(
                        json_object(
                            'id', c.id,
                            'technical_name', c.technical_name,
                            'display_name', c.display_name
                        )
                    ) AS categories_json
                FROM images_categories ic
                JOIN categories c ON c.id = ic.category_id
                GROUP BY ic.image_id
            ) c ON c.image_id = i.id

            WHERE i.id = ?
            LIMIT 1
        `;

    const row = await DatabaseService.getInstance().get(sql, [id]);

    if (!row) {
        return null;
    }

    const image: CatalogImage = {
        id: row.id,
        hash: row.hash,
        name: row.name,
        is_favorite: row.is_favorite === 1,
        tags: JSON.parse(row.tags_json),
        categories: JSON.parse(row.categories_json),
        added_at: row.added_at,
        updated_at: row.updated_at,
    };

    return image;
});

register<{ name: string; hash: string }, CatalogImage>('create-catalog-image', async (event, { name, hash }) => {
    const sql = `INSERT INTO images (name, hash) VALUES (?, ?);`;
    await DatabaseService.getInstance().run(sql, [name, hash]);

    const recordSql = `SELECT * FROM images WHERE hash = ? LIMIT 1;`;
    return (await DatabaseService.getInstance().get(recordSql, [hash])) as CatalogImage;
});

register<{ payload: ImageFilePayload }, ImageFilePayload>('persist-image-file', async (event, { payload }) => {
    const nodeBuffer = Buffer.from(payload.data);

    if (!(await ValidationService.isValidImageBuffer(nodeBuffer))) {
        throw new Error('File is not recognized as an image');
    }

    if (!(await ValidationService.fileSizeIsValid(nodeBuffer))) {
        throw new Error('File size exceeds the maximum allowed limit or is zero bytes');
    }

    const webpBuffer = await new ImageConversionService(nodeBuffer).toWebP();
    if (!webpBuffer || webpBuffer.length === 0) {
        throw new Error('Failed to convert image to webp format');
    }

    await FileStorageService.store(`${payload.hash}.${process.env.IMAGE_CONVERSION_TYPE}`, webpBuffer, '/images');
    return payload;
});

register<{ imageId: string; newName: string }, void>(
    'update-catalog-image-name',
    async (event, { imageId, newName }) => {
        const sql = `UPDATE images SET name = ?,  updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await DatabaseService.getInstance().run(sql, [newName, imageId]);
    },
);

register<{ imageId: string; isFavorite: boolean }, void>(
    'update-catalog-image-favorite',
    async (event, { isFavorite, imageId }) => {
        const sql = `UPDATE images SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await DatabaseService.getInstance().run(sql, [isFavorite ? 1 : 0, imageId]);
    },
);

register<{ id: string; onlyRecord: boolean }, void>('delete-image', async (event, { id, onlyRecord }) => {
    const imageSql = `SELECT * FROM images WHERE id = ? LIMIT 1`;
    const image = (await DatabaseService.getInstance().get(imageSql, [id])) as CatalogImage;

    if (!image) {
        throw new Error(`Image with id ${id} not found for deletion`);
    }

    const sql = `DELETE FROM images WHERE id = ?`;
    await DatabaseService.getInstance().run(sql, [id]);

    if (onlyRecord) return;

    FileStorageService.delete(`${image.hash}.${process.env.IMAGE_CONVERSION_TYPE}`, '/images');
});
