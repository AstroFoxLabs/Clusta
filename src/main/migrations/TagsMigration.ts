import { Migration } from '../services/MigrationService.js';
import DatabaseService from '../services/DatabaseService.js';

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
        return;
    }
}
