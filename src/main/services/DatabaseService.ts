import path from 'path';
import sqlite3 from 'sqlite3';
import LogService from './LogService.js';
import SettingsService from './SettingsService.js';

export default class DatabaseService {
    // %appdata%/roaming/refarchive/app.db
    static DB_PATH = path.join(SettingsService.getInstance().getSettings().paths.userData, 'app.db');
    static instance: DatabaseService | null = null;
    db: sqlite3.Database | null = null;

    static getInstance(): DatabaseService {
        if (!this.instance) {
            this.instance = new DatabaseService();
            return this.instance;
        } else {
            return this.instance;
        }
    }

    init(dbPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    LogService.error('Error opening database:', err);
                    reject(err);
                } else {
                    LogService.info('Database initialized at', dbPath);
                    resolve();
                }
            });
        });
    }

    close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        LogService.error('Error closing DB:', err);
                        reject(err);
                    } else {
                        this.db = null;
                        LogService.info('Database connection closed.');
                        resolve();
                    }
                });
            }
        });
    }

    run(sql: any, params: any): Promise<void | number> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.run(sql, params || [], function (err) {
                    if (err) {
                        LogService.error(`Error running sql: ${sql} With params: ${JSON.stringify(params)}`, err);
                        reject(err);
                    } else {
                        // Retuns the last inserted id if the statement was an insert, otherwise just resolves
                        if (this.lastID) resolve(this.lastID);
                        resolve();
                    }
                });
            } else {
                reject(new Error('Database not initialized'));
            }
        });
    }

    all(sql: any, params: any = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.all(sql, params || [], (err, rows) => {
                    if (err) {
                        LogService.error(`Error running sql: ${sql} With params: ${JSON.stringify(params)}`, err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            }
        });
    }

    get(sql: any, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.get(sql, params || [], (err, row) => {
                    if (err) {
                        LogService.error(`Error running sql: ${sql} With params: ${JSON.stringify(params)}`, err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            }
        });
    }

    exec(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.exec(sql, (err) => {
                    if (err) {
                        LogService.error(`Error executing sql script: ${sql}`, err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }
}
