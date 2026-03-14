import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class ImagesTagsMigration implements Migration {
    name = '005_images_tags_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS images_tags (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', image_id INTEGER NOT NULL ' +
                ', tag_id INTEGER NOT NULL ' +
                ', FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE ' +
                ', FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE ' +
                ')',
            [],
        );
    }
}
