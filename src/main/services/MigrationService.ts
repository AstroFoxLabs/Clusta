import ImagesMigration from '@main/migrations/001_images_migration.js';
import CategoriesMigration from '@main/migrations/002_categories_migration.js';
import TagsMigration from '@main/migrations/003_tags_migration.js';
import ImagesCategoriesMigration from '@main/migrations/004_images_categories_migration.js';
import ImagesTagsMigration from '@main/migrations/005_images_tags_migration.js';
import ExcalidrawMigration from '@main/migrations/006_excalidraw_migration.js';
import DefaultDataMigration from '@main/migrations/007_default_data_migration.js';
import DatabaseService from './DatabaseService.js';

export interface Migration {
    name: string;
    up: () => Promise<void>;
    down?: () => Promise<void>;
}

export default class MigrationService {
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
        const defaultDataMigration = new DefaultDataMigration();

        this.migrations.push(
            imagesMigration,
            categoriesMigration,
            tagsMigration,
            imagesCategoriesMigration,
            imagesTagsMigration,
            excalidrawMigration,
            defaultDataMigration,
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
