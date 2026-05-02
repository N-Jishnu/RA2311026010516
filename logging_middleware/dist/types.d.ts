export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service' | 'auth' | 'config' | 'middleware' | 'utils';
export interface LogEntry {
    stack: LogStack;
    level: LogLevel;
    package: LogPackage;
    message: string;
}
export interface AuthConfig {
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
}
export interface TokenResponse {
    token: string;
    expiresAt: number;
}
