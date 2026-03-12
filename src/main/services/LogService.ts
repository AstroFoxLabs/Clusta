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
                    Logger.info(logMessage, errorValue);
                    console.info(logMessage, errorValue);
                } else {
                    Logger.info(logMessage);
                    console.info(logMessage);
                }
                break;

            case 'warn':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.warn(logMessage, errorValue);
                    console.warn(logMessage, errorValue);
                } else {
                    Logger.warn(logMessage);
                    console.warn(logMessage);
                }
                break;

            case 'critical':
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.error(`CRITICAL:---- ${logMessage}`, errorValue);
                    console.error(`CRITICAL:---- ${logMessage}`, errorValue);
                } else {
                    Logger.error(`CRITICAL:---- ${logMessage}`);
                    console.error(`CRITICAL:---- ${logMessage}`);
                }
                break;

            default:
                if (errorValue !== undefined && errorValue !== null) {
                    Logger.info(logMessage, errorValue);
                    console.log(logMessage, errorValue);
                } else {
                    Logger.info(logMessage);
                    console.log(logMessage);
                }
        }
    }
}
