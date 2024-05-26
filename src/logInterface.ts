
export type logFunction = (s: string) => void;
export type logLevelFunction = (s: string, logLevel: number) => void;


// Define LogLevel as an enumeration
export enum LogLevel {
    Info,
    Error,
    Debug
}

// A Logger has a logFunction and a LogLevel
export interface Logger {
    logFunction: logFunction;
    logLevel: LogLevel;
}