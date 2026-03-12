import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class CategoriesMigration implements Migration {
    name = '002_categories_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS categories (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', display_name TEXT NOT NULL ' +
                ', technical_name TEXT NOT NULL UNIQUE' +
                ', added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP ' +
                ', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP ' +
                ')',
            [],
        );
    }
}
