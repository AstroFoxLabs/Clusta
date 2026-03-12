import { CatalogImage } from '@shared/types.js';
import DatabaseService from './DatabaseService.js';
import FileStorageService from './FileStorageService.js';
import LogService from './LogService.js';
import SettingsService from './SettingsService.js';

export default class CleanUpService {
    static async all(): Promise<void> {
        await CleanUpService.removeOrphanedImageRecords();
        await CleanUpService.removeOrphanedImageFiles();
        await CleanUpService.removeOrphanedExcalidrawFiles();
        await CleanUpService.removeOrphanedExcalidrawRecords();
    }

    static async removeOrphanedImageRecords(): Promise<void> {
        const orphanedFiles: string[] = [];
        let sql = 'SELECT * FROM images';
        const images = (await DatabaseService.getInstance().all(sql)) as CatalogImage[];

        for (const image of images) {
            const fileExists = FileStorageService.pathExists(
                `${SettingsService.getInstance().getSettings().paths.images}/${image.hash}.${process.env.IMAGE_CONVERSION_TYPE || 'webp'}`,
            );

            if (!fileExists) {
                orphanedFiles.push(image.id);
            }
        }

        if (orphanedFiles.length === 0) return;

        LogService.info(`Found ${orphanedFiles.length} orphaned Image records. Removing...`);
        sql = `DELETE FROM images WHERE id IN (${orphanedFiles.map(() => '?').join(',')})`;
        await DatabaseService.getInstance().run(sql, orphanedFiles);
    }

    static async removeOrphanedImageFiles(): Promise<void> {
        const existingFileNames = FileStorageService.getNames('images');

        if (existingFileNames.length === 0) return;

        const sql = 'SELECT hash FROM images';
        const hashesInDb = (await DatabaseService.getInstance().all(sql)).map(({ hash }: { hash: string }) => hash);

        for (const existingFileName of existingFileNames) {
            const fileHash = existingFileName.split('.')[0];
            if (!hashesInDb.includes(fileHash)) {
                FileStorageService.delete(existingFileName, 'images');
                LogService.info(`Clean Up orphaned Image File: ${existingFileName}`);
            }
        }
    }

    static async removeOrphanedExcalidrawFiles(): Promise<void> {
        const existingFileNames = FileStorageService.getNames('excalidraw');
        if (existingFileNames.length === 0) return;

        const sql = 'SELECT uuid FROM excalidraw_scenes';
        const idsInDb = (await DatabaseService.getInstance().all(sql)).map(({ uuid }: { uuid: string }) => uuid);
        for (const existingFileName of existingFileNames) {
            const fileId = existingFileName.split('.')[0];
            if (!idsInDb.includes(fileId)) {
                FileStorageService.delete(existingFileName, 'excalidraw');
                LogService.info(`Clean Up orphaned Excalidraw File: ${existingFileName}`);
            }
        }
    }

    static async removeOrphanedExcalidrawRecords(): Promise<void> {
        const orphanedFiles: string[] = [];
        let sql = 'SELECT * FROM excalidraw_scenes';
        const excalidraws = (await DatabaseService.getInstance().all(sql)) as {
            uuid: string;
        }[];
        for (const excalidraw of excalidraws) {
            const fileExists = FileStorageService.pathExists(
                `${SettingsService.getInstance().getSettings().paths.excalidraw}/${excalidraw.uuid}.excalidraw`,
            );
            if (!fileExists) {
                orphanedFiles.push(excalidraw.uuid);
            }
        }

        if (orphanedFiles.length === 0) return;
        LogService.info(`Found ${orphanedFiles.length} orphaned Excalidraw records. Removing...`);
        sql = `DELETE FROM excalidraw_scenes WHERE uuid IN (${orphanedFiles.map(() => '?').join(',')})`;
        await DatabaseService.getInstance().run(sql, orphanedFiles);
    }
}
