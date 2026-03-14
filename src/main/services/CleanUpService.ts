import { FileNameIdentifier, Identifier, ImageExtension } from '@shared/types.js';
import DatabaseService from './DatabaseService.js';
import FileStorageService from './FileStorageService.js';
import LogService from './LogService.js';
import SettingsService from './SettingsService.js';

export default class CleanUpService {
    static async all(): Promise<void> {

    }

    // Removes records and files that are not linked to each other anymore.
    // Example: Image record exists in DB but the file is deleted from disk or vice versa.
    static async removeOrphaned(
        tableName: string,
        dbIdentifier: Identifier, // Identifier column in the database (e.g. id or uuid)
        dirPath: string, // Directory where the files are stored
        fileExtension: ImageExtension | 'excalidraw',
        fileNameColumn: FileNameIdentifier, // Column storing the filename for the image
    ): Promise<void> {
        const allRecords = await DatabaseService.getInstance().all(`SELECT * FROM ${tableName}`);

        // Collect IDs of orphaned records
        const orphanedRecordIds: string[] = [];
        const dbFileNames: string[] = [];

        for (const record of allRecords) {
            if (fileNameColumn in record) {
                const fileName = record[fileNameColumn];
                dbFileNames.push(fileName);

                const fileFullPath = `${dirPath}/${fileName}.${fileExtension}`;
                if (!FileStorageService.pathExists(fileFullPath)) {
                    if (dbIdentifier in record) {
                        orphanedRecordIds.push(record[dbIdentifier]);
                    }
                }
            }
        }

        // Delete orphaned records
        if (orphanedRecordIds.length > 0) {
            const placeholders = orphanedRecordIds.map(() => '?').join(',');
            const deleteSql = `DELETE FROM ${tableName} WHERE ${dbIdentifier} IN (${placeholders})`;
            await DatabaseService.getInstance().run(deleteSql, orphanedRecordIds);
        }

        // Remove orphaned files
        const existingFiles = FileStorageService.getFileNames(dirPath, '');
        for (const file of existingFiles) {
            const baseFileName = file.split('.')[0];
            if (!dbFileNames.includes(baseFileName)) {
                FileStorageService.delete(`${dirPath}/${file}`);
                LogService.info(`Cleaned up orphaned image file: ${file}`);
            }
        }
    }
}
