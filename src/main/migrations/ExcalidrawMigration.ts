import DatabaseService from '@main/services/DatabaseService.js';
import { Migration } from '@main/services/MigrationService.js';

export default class ExcalidrawMigration implements Migration {
    name = '006_excalidraw_migration';

    async up(): Promise<void> {
        const db = DatabaseService.getInstance();
        await db.run(
            'CREATE TABLE IF NOT EXISTS excalidraw_scenes (' +
                'uuid TEXT PRIMARY KEY NOT NULL ' +
                ', name TEXT NOT NULL ' +
                ', added_at DATETIME DEFAULT CURRENT_TIMESTAMP ' +
                ', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ' +
                ')',
            [],
        );
    }
}
