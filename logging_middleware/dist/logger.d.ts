import type { AuthConfig } from './types';
export declare function configureAuth(config: AuthConfig): void;
export declare function Log(stack: string, level: string, packageName: string, message: string): Promise<string | null>;
export declare const Logger: {
    configure: typeof configureAuth;
    log: typeof Log;
};
export default Logger;
