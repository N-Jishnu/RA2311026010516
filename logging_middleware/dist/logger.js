"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.configureAuth = configureAuth;
exports.Log = Log;
const LOG_API_URL = 'http://20.207.122.201/evaluation-service/logs';
const AUTH_API_URL = 'http://20.207.122.201/evaluation-service/auth';
let cachedToken = null;
let tokenExpiresAt = 0;
let authConfig = null;
const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_PACKAGES = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];
const ALL_PACKAGES = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
function isValidStack(stack) {
    return STACKS.includes(stack);
}
function isValidLevel(level) {
    return LEVELS.includes(level);
}
function isValidPackage(stack, packageName) {
    const packages = stack === 'backend' ? ALL_PACKAGES : SHARED_PACKAGES;
    return packages.includes(packageName);
}
function isTokenExpired() {
    return Date.now() >= tokenExpiresAt;
}
async function fetchToken() {
    if (!authConfig) {
        console.error('[Logger] Auth config not initialized');
        return null;
    }
    try {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authConfig),
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
            console.error('[Logger] Auth request failed:', response.status);
            return null;
        }
        const data = await response.json();
        if (!data.access_token) {
            console.error('[Logger] No token in auth response');
            return null;
        }
        cachedToken = data.access_token;
        if (data.expires_in && data.expires_in > 1000000000000) {
            tokenExpiresAt = data.expires_in;
        }
        else {
            tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
        }
        return cachedToken;
    }
    catch (error) {
        console.error('[Logger] Auth fetch error:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}
async function getValidToken() {
    if (cachedToken && !isTokenExpired()) {
        return cachedToken;
    }
    return await fetchToken();
}
async function sendLog(entry) {
    const token = await getValidToken();
    if (!token) {
        console.error('[Logger] No valid token available');
        return null;
    }
    try {
        const response = await fetch(LOG_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entry),
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
            if (response.status === 401) {
                const retryToken = await fetchToken();
                if (retryToken) {
                    const retryResponse = await fetch(LOG_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${retryToken}`
                        },
                        body: JSON.stringify(entry),
                        signal: AbortSignal.timeout(5000)
                    });
                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        return data.logID || null;
                    }
                }
            }
            console.error('[Logger] Log request failed:', response.status);
            return null;
        }
        const data = await response.json();
        return data.logID || null;
    }
    catch (error) {
        console.error('[Logger] Log send error:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}
function configureAuth(config) {
    authConfig = config;
    cachedToken = null;
    tokenExpiresAt = 0;
}
async function Log(stack, level, packageName, message) {
    if (!isValidStack(stack)) {
        console.error('[Logger] Invalid stack:', stack);
        return null;
    }
    if (!isValidLevel(level)) {
        console.error('[Logger] Invalid level:', level);
        return null;
    }
    if (!isValidPackage(stack, packageName)) {
        console.error('[Logger] Invalid package:', packageName, 'for stack:', stack);
        return null;
    }
    const entry = {
        stack: stack,
        level: level,
        package: packageName,
        message
    };
    sendLog(entry).catch(err => {
        console.error('[Logger] Async log error:', err instanceof Error ? err.message : 'Unknown error');
    });
    return null;
}
exports.Logger = {
    configure: configureAuth,
    log: Log
};
exports.default = exports.Logger;
