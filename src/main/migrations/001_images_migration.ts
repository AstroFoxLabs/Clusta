import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class ImagesMigration implements Migration {
    name = '001_images_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS images (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', hash TEXT NOT NULL UNIQUE ' +
                ', name TEXT NOT NULL ' +
                ', is_favorite INTEGER NOT NULL DEFAULT 0 ' +
                ', added_at DATETIME DEFAULT CURRENT_TIMESTAMP ' +
                ', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ' +
                ', info TEXT ' +
                ')',
            [],
        );
    }
}
