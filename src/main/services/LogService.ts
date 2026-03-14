import Logger from 'electron-log/main.js';
import fs from 'fs';

interface LogData {
    msg: string;
    err?: Error | unknown | null;
    type?: 'info' | 'error' | 'warn' | 'critical';
}

export default class LogService {
    static clearLogFile() {
        const filePath = Logger.transports.file.getFile().path;
        fs.truncateSync(filePath, 0);
    }

    static error(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'error' });
    }

    static info(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'info' });
    }

    static warn(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'warn' });
    }

    // Require attention and might terminate the app. Should be used for unrecoverable errors.
    static critical(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'critical' });
    }

    // Master log method. Does not needed to be called directly.
    static log({ msg, err, type = 'info' }: LogData) {
        const logMessage = `[${new Date().toISOString()}] ${msg}`;
        const errorValue = err instanceof Error ? err.stack : err;

        switch (type) {
            case 'error':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.error(logMessage, errorValue);
                    console.error(logMessage, errorValue);
                } else {
                    Logger.error(logMessage);
                    console.error(logMessage);
                }
                break;

            case 'info':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.info(`INFO: ${logMessage}`, errorValue);
                    console.info(`INFO: ${logMessage}`, errorValue);
                } else {
                    Logger.info(`INFO: ${logMessage}`);
                    console.info(`INFO: ${logMessage}`);
                }
                break;

            case 'warn':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.warn(`WARN: ${logMessage}`, errorValue);
                    console.warn(`WARN: ${logMessage}`, errorValue);
                } else {
                    Logger.warn(`WARN: ${logMessage}`);
                    console.warn(`WARN: ${logMessage}`);
                }
                break;

            case 'critical':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.error(`CRITICAL: ${logMessage}`, errorValue);
                    console.error(`CRITICAL: ${logMessage}`, errorValue);
                } else {
                    Logger.error(`CRITICAL: ${logMessage}`);
                    console.error(`CRITICAL: ${logMessage}`);
                }
                break;

            default:
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.info(`DEFAULT: ${logMessage}`, errorValue);
                    console.log(`DEFAULT: ${logMessage}`, errorValue);
                } else {
                    Logger.info(`DEFAULT: ${logMessage}`);
                    console.log(`DEFAULT: ${logMessage}`);
                }
        }
    }
}
