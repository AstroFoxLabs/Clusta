import { Migration } from '../services/MigrationService.js';
import DatabaseService from '../services/DatabaseService.js';

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
        return;
    }
}
