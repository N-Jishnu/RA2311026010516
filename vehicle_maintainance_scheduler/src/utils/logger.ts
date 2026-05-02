export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service'
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils';

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

const LOG_API_URL = 'http://20.207.122.201/evaluation-service/logs';
const AUTH_API_URL = 'http://20.207.122.201/evaluation-service/auth';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let authConfig: AuthConfig | null = null;

const STACKS: LogStack[] = ['backend', 'frontend'];
const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_PACKAGES: LogPackage[] = [
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
];
const SHARED_PACKAGES: LogPackage[] = ['auth', 'config', 'middleware', 'utils'];
const ALL_PACKAGES: LogPackage[] = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];

function isValidStack(stack: string): stack is LogStack {
  return STACKS.includes(stack as LogStack);
}

function isValidLevel(level: string): level is LogLevel {
  return LEVELS.includes(level as LogLevel);
}

function isValidPackage(stack: LogStack, packageName: string): packageName is LogPackage {
  const packages = stack === 'backend' ? ALL_PACKAGES : SHARED_PACKAGES;
  return packages.includes(packageName as LogPackage);
}

function isTokenExpired(): boolean {
  return Date.now() >= tokenExpiresAt;
}

async function fetchToken(): Promise<string | null> {
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

    const data = await response.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      console.error('[Logger] No token in auth response');
      return null;
    }

    cachedToken = data.access_token;
    if (data.expires_in && data.expires_in > 1000000000000) {
      tokenExpiresAt = data.expires_in;
    } else {
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    }
    return cachedToken;
  } catch (error) {
    console.error('[Logger] Auth fetch error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function getValidToken(): Promise<string | null> {
  if (cachedToken && !isTokenExpired()) {
    return cachedToken;
  }
  return await fetchToken();
}

async function sendLog(entry: LogEntry): Promise<string | null> {
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
            const data = await retryResponse.json() as { logID?: string };
            return data.logID || null;
          }
        }
      }
      console.error('[Logger] Log request failed:', response.status);
      return null;
    }

    const data = await response.json() as { logID?: string };
    return data.logID || null;
  } catch (error) {
    console.error('[Logger] Log send error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export function configure(config: AuthConfig): void {
  authConfig = config;
  cachedToken = null;
  tokenExpiresAt = 0;
}

export async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
): Promise<string | null> {
  if (!isValidStack(stack)) {
    console.error('[Logger] Invalid stack:', stack);
    return null;
  }

  if (!isValidLevel(level)) {
    console.error('[Logger] Invalid level:', level);
    return null;
  }

  if (!isValidPackage(stack as LogStack, packageName)) {
    console.error('[Logger] Invalid package:', packageName, 'for stack:', stack);
    return null;
  }

  const entry: LogEntry = {
    stack: stack as LogStack,
    level: level as LogLevel,
    package: packageName as LogPackage,
    message
  };

  sendLog(entry).catch(err => {
    console.error('[Logger] Async log error:', err instanceof Error ? err.message : 'Unknown error');
  });

  return null;
}

export const Logger = {
  configure,
  log: Log
};

export default Logger;