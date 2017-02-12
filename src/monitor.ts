
let isLoggingOutputEnabled = false;

export function enabledLogging(isEnabled = true) {
    isLoggingOutputEnabled = isEnabled;
}

export function disableLogging() {
    enabledLogging(false);
}

export function isLoggingEnabled() {
    return isLoggingOutputEnabled;
}

export function log(message: any, ...args: any[]) {
    if (isLoggingEnabled()) {
        console.log(message, ...args);
    }
}

export function logTs(message: any) {
    if (isLoggingEnabled()) {
        const ts = Date.now();
        log(`${ts} - ${message}`);
    }
}

