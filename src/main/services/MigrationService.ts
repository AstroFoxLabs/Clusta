import CategoriesMigration from '../migrations/CategoriesMigration.js';
import ExcalidrawMigration from '../migrations/ExcalidrawMigration.js';
import ImagesCategoriesMigration from '../migrations/ImagesCategoriesMigration.js';
import ImagesMigration from '../migrations/ImagesMigration.js';
import ImagesTagsMigration from '../migrations/ImagesTagsMigration.js';
import TagsMigration from '../migrations/TagsMigration.js';
import DatabaseService from './DatabaseService.js';

export interface Migration {
    name: string;
    up: () => Promise<void>;
    down?: () => Promise<void>;
}

export class MigrationService {
    migrations: Migration[] = [];

    constructor() {
        this.registerMigrations();
    }

    async initializeMigrationTable() {
        const db = DatabaseService.getInstance();
        return await db.run(
            'CREATE TABLE IF NOT EXISTS migrations (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                ', name TEXT NOT NULL UNIQUE ' +
                ', executed_at DATETIME DEFAULT CURRENT_TIMESTAMP ' +
                ')',
            [],
        );
    }

    private registerMigrations() {
        const imagesMigration = new ImagesMigration();
        const categoriesMigration = new CategoriesMigration();
        const tagsMigration = new TagsMigration();
        const imagesCategoriesMigration = new ImagesCategoriesMigration();
        const imagesTagsMigration = new ImagesTagsMigration();
        const excalidrawMigration = new ExcalidrawMigration();

        this.migrations.push(
            imagesMigration,
            categoriesMigration,
            tagsMigration,
            imagesCategoriesMigration,
            imagesTagsMigration,
            excalidrawMigration,
        );

        // Ensure correct order (Naming important)
        this.migrations.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Migration table stores executed migrations.
    // If migration class is not present in the table, it will be executed and stored.
    async runMigrations() {
        const db = DatabaseService.getInstance();
        for (const migration of this.migrations) {
            const alreadyExecuted = await db.get('SELECT * FROM migrations WHERE name = ?', [migration.name]);
            if (!alreadyExecuted) {
                await migration.up();
                await db.run('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
            }
        }
    }
}
