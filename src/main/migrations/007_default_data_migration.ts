import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class DefaultDataMigration implements Migration {
    name = '007_default_data_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'INSERT INTO images (' +
                'id, hash, name, is_favorite, added_at, updated_at' +
                ') VALUES (?, ?, ?, ?, ?, ?)',
            [1, 'cutefox', 'Cute Fox', 0, 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP'],
        );
    }
}
