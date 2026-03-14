import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class TagsMigration implements Migration {
    name = '003_tags_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS tags (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', technical_name TEXT NOT NULL UNIQUE' +
                ')',
            [],
        );
    }
}
