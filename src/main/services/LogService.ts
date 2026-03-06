import log from 'electron-log/main.js';

interface LogData {
    msg: string;
    err?: Error | unknown | null;
    type?: 'info' | 'error' | 'warn';
}

export class LogService {
    static error(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'error' });
    }

    static info(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'info' });
    }

    static warn(msg: string, err?: Error | unknown) {
        LogService.log({ msg, err, type: 'warn' });
    }

    // Master log method. Does not needed to be called directly.
    static log({ msg, err, type = 'info' }: LogData) {
        const logMessage = `[${new Date().toISOString()}] ${msg}`;
        const errorValue = err instanceof Error ? err.stack : err;

        switch (type) {
            case 'error':
                if (errorValue !== undefined && errorValue !== null) {
                    log.error(logMessage, errorValue);
                    console.error(logMessage, errorValue);
                } else {
                    log.error(logMessage);
                    console.error(logMessage);
                }
                break;

            case 'info':
                if (errorValue !== undefined && errorValue !== null) {
                    log.info(logMessage, errorValue);
                    console.info(logMessage, errorValue);
                } else {
                    log.info(logMessage);
                    console.info(logMessage);
                }
                break;

            case 'warn':
                if (errorValue !== undefined && errorValue !== null) {
                    log.warn(logMessage, errorValue);
                    console.warn(logMessage, errorValue);
                } else {
                    log.warn(logMessage);
                    console.warn(logMessage);
                }
                break;

            default:
                if (errorValue !== undefined && errorValue !== null) {
                    log.info(logMessage, errorValue);
                    console.log(logMessage, errorValue);
                } else {
                    log.info(logMessage);
                    console.log(logMessage);
                }
        }
    }
}
