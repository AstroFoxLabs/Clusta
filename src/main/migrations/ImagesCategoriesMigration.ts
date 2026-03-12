import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class ImagesCategoriesMigration implements Migration {
    name = '004_images_categories_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS images_categories (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', image_id INTEGER NOT NULL ' +
                ', category_id INTEGER NOT NULL ' +
                ', FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE ' +
                ', FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE ' +
                ')',
            [],
        );
    }
}
