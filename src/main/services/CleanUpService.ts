import { CatalogImage } from '@shared/types.js';
import DatabaseService from './DatabaseService.js';
import FileStorageService from './FileStorageService.js';
import { LogService } from './LogService.js';
import SettingsService from './SettingsService.js';
import ValidationService from './ValidationService.js';

export default class CleanUpService {
    static async all(): Promise<void> {
        try {
            await CleanUpService.removeOrphanedImageRecords();
            await CleanUpService.removeOrphanedImageFiles();
            await CleanUpService.removeOrphanedExcalidrawFiles();
            await CleanUpService.removeOrphanedExcalidrawRecords();
        } catch (err) {
            LogService.error('CleanUpService.all failed:', err);
            throw err;
        }
    }

    static async removeOrphanedImageRecords(): Promise<void> {
        try {
            const orphanedFiles: string[] = [];
            let sql = 'SELECT * FROM images';
            const images = (await DatabaseService.getInstance().all(sql, {})) as CatalogImage[];
            for (const image of images) {
                const fileExists = ValidationService.fileExists(
                    `${SettingsService.getInstance().getSettings().paths.imageDefaultPath}/${image.hash}.${process.env.IMAGE_CONVERSION_TYPE || 'webp'}`,
                );

                if (!fileExists) {
                    orphanedFiles.push(image.id);
                }
            }

            if (orphanedFiles.length === 0) return;

            sql = `DELETE FROM images WHERE id IN (${orphanedFiles.map(() => '?').join(',')})`;
            await DatabaseService.getInstance().run(sql, orphanedFiles);
        } catch (err) {
            LogService.error('CleanUpService.removeOrphanedImageRecords failed:', err);
            throw err;
        }
    }

    static async removeOrphanedImageFiles(): Promise<void> {
        try {
            const existingFileNames = FileStorageService.getNames('images');

            if (existingFileNames.length === 0) return;

            const sql = 'SELECT hash FROM images';
            const hashesInDb = (await DatabaseService.getInstance().all(sql, {})).map(
                ({ hash }: { hash: string }) => hash,
            );

            for (const existingFileName of existingFileNames) {
                const fileHash = existingFileName.split('.')[0];
                if (!hashesInDb.includes(fileHash)) {
                    FileStorageService.delete(existingFileName, 'images');
                    LogService.warn(`Clean Up orphaned Image File: ${existingFileName}`);
                }
            }
        } catch (err) {
            LogService.error('CleanUpService.removeOrphanedImageFiles failed:', err);
            throw err;
        }
    }

    static async removeOrphanedExcalidrawFiles(): Promise<void> {
        try {
            const existingFileNames = FileStorageService.getNames('excalidraw');
            if (existingFileNames.length === 0) return;

            const sql = 'SELECT uuid FROM excalidraw_scenes';
            const idsInDb = (await DatabaseService.getInstance().all(sql, {})).map(
                ({ uuid }: { uuid: string }) => uuid,
            );
            for (const existingFileName of existingFileNames) {
                const fileId = existingFileName.split('.')[0];
                if (!idsInDb.includes(fileId)) {
                    FileStorageService.delete(existingFileName, 'excalidraw');
                    LogService.warn(`Clean Up orphaned Excalidraw File: ${existingFileName}`);
                }
            }
        } catch (err) {
            LogService.error('CleanUpService.removeOrphanedExcalidrawFiles failed:', err);
            throw err;
        }
    }

    static async removeOrphanedExcalidrawRecords(): Promise<void> {
        try {
            const orphanedFiles: string[] = [];
            let sql = 'SELECT * FROM excalidraw_scenes';
            const excalidraws = (await DatabaseService.getInstance().all(sql, {})) as {
                uuid: string;
            }[];
            for (const excalidraw of excalidraws) {
                const fileExists = ValidationService.fileExists(
                    `${SettingsService.getInstance().getSettings().paths.excalidrawDefaultPath}/${excalidraw.uuid}.excalidraw`,
                );
                if (!fileExists) {
                    orphanedFiles.push(excalidraw.uuid);
                }
            }

            if (orphanedFiles.length === 0) return;
            sql = `DELETE FROM excalidraw_scenes WHERE uuid IN (${orphanedFiles.map(() => '?').join(',')})`;
            await DatabaseService.getInstance().run(sql, orphanedFiles);
        } catch (err) {
            LogService.error('CleanUpService.removeOrphanedExcalidrawRecords failed:', err);
            throw err;
        }
    }
}
