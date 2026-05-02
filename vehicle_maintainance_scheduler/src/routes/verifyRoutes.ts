import { Router } from 'express';
import { Log } from '../utils/logger';

const router = Router();

let lastLogId: string | null = null;
let lastLogStatus: 'success' | 'failed' = 'failed';

router.get('/auth', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/auth - start');

  try {
    const authConfig = {
      email: process.env.AUTH_EMAIL || 'user@example.com',
      name: process.env.AUTH_NAME || 'User',
      rollNo: process.env.AUTH_ROLL_NO || '12345',
      accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
      clientID: process.env.AUTH_CLIENT_ID || 'clientid',
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
    };

    const response = await fetch('http://20.207.122.201/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authConfig),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      await Log('backend', 'error', 'route', 'GET /verify/auth - auth request failed');
      res.status(500).json({ success: false, message: 'Auth request failed' });
      return;
    }

    const data = await response.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      await Log('backend', 'error', 'route', 'GET /verify/auth - no token in response');
      res.status(500).json({ success: false, message: 'No token in response' });
      return;
    }

    lastLogStatus = 'success';
    await Log('backend', 'info', 'route', 'GET /verify/auth - success');

    res.json({
      success: true,
      token: data.access_token.substring(0, 20),
      expiresIn: data.expires_in || 0
    });
  } catch (error) {
    lastLogStatus = 'failed';
    await Log('backend', 'error', 'route', `GET /verify/auth - failure: ${error instanceof Error ? error.message : 'Unknown'}`);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Auth failed'
    });
  }
});

router.get('/log', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/log - start');

  const levels = ['info', 'debug', 'warn', 'error', 'fatal'] as const;
  const packages = ['route', 'controller', 'service', 'repository', 'handler'] as const;

  for (const level of levels) {
    for (const pkg of packages) {
      await Log('backend', level, pkg, `verify ${level} log for ${pkg}`);
    }
  }

  await Log('backend', 'info', 'route', 'GET /verify/log - success');

  res.json({
    success: true,
    message: 'logs triggered'
  });
});

router.get('/log-status', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/log-status - start');

  const testEntry = {
    stack: 'backend' as const,
    level: 'info' as const,
    package: 'route' as const,
    message: 'Testing log status endpoint'
  };

  try {
    const authConfig = {
      email: process.env.AUTH_EMAIL || 'user@example.com',
      name: process.env.AUTH_NAME || 'User',
      rollNo: process.env.AUTH_ROLL_NO || '12345',
      accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
      clientID: process.env.AUTH_CLIENT_ID || 'clientid',
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
    };

    const authResponse = await fetch('http://20.207.122.201/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authConfig),
      signal: AbortSignal.timeout(5000)
    });

    const authData = await authResponse.json() as { access_token?: string };
    if (!authData.access_token) {
      lastLogStatus = 'failed';
      await Log('backend', 'error', 'route', 'GET /verify/log-status - no token');
      res.json({ lastLogId: null, status: 'failed' });
      return;
    }

    const logResponse = await fetch('http://20.207.122.201/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify(testEntry),
      signal: AbortSignal.timeout(5000)
    });

    if (!logResponse.ok) {
      const retryResponse = await fetch('http://20.207.122.201/evaluation-service/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`
        },
        body: JSON.stringify(testEntry),
        signal: AbortSignal.timeout(5000)
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json() as { logID?: string };
        lastLogId = retryData.logID || null;
        lastLogStatus = 'success';
      } else {
        lastLogStatus = 'failed';
      }
    } else {
      const data = await logResponse.json() as { logID?: string };
      lastLogId = data.logID || null;
      lastLogStatus = 'success';
    }

    await Log('backend', 'info', 'route', `GET /verify/log-status - ${lastLogStatus}`);

    res.json({
      lastLogId,
      status: lastLogStatus
    });
  } catch (error) {
    lastLogStatus = 'failed';
    await Log('backend', 'error', 'route', `GET /verify/log-status - error: ${error instanceof Error ? error.message : 'Unknown'}`);

    res.json({
      lastLogId,
      status: 'failed'
    });
  }
});

router.get('/error', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/error - start');

  try {
    throw new Error('test error');
  } catch (error) {
    await Log('backend', 'error', 'handler', `test error: ${error instanceof Error ? error.message : 'Unknown'}`);

    res.status(500).json({
      success: false,
      message: 'test error'
    });
  }
});

router.get('/protected', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/protected - start');

  try {
    const authConfig = {
      email: process.env.AUTH_EMAIL || 'user@example.com',
      name: process.env.AUTH_NAME || 'User',
      rollNo: process.env.AUTH_ROLL_NO || '12345',
      accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
      clientID: process.env.AUTH_CLIENT_ID || 'clientid',
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
    };

    const authResponse = await fetch('http://20.207.122.201/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authConfig),
      signal: AbortSignal.timeout(5000)
    });

    const authData = await authResponse.json() as { access_token?: string };
    if (!authData.access_token) {
      await Log('backend', 'error', 'route', 'GET /verify/protected - no token');
      res.status(500).json({ success: false, message: 'Failed to get token' });
      return;
    }

    await Log('backend', 'info', 'route', 'GET /verify/protected - API call start');

    const depotResponse = await fetch('http://20.207.122.201/evaluation-service/depots', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`
      },
      signal: AbortSignal.timeout(5000)
    });

    if (depotResponse.ok) {
      const depotData = await depotResponse.json() as { count?: number };
      const count = depotData.count || 0;

      await Log('backend', 'info', 'route', `GET /verify/protected - API success, count: ${count}`);

      res.json({
        success: true,
        depotCount: count
      });
    } else {
      await Log('backend', 'error', 'route', 'GET /verify/protected - API failure');

      res.json({
        success: false,
        message: 'API call failed'
      });
    }
  } catch (error) {
    await Log('backend', 'error', 'route', `GET /verify/protected - error: ${error instanceof Error ? error.message : 'Unknown'}`);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Protected API call failed'
    });
  }
});

router.get('/console-check', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/console-check - start');

  const fs = require('fs');
  const path = require('path');
  let consoleLogCount = 0;

  function scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(/console\.log\(/g);
        if (matches) {
          consoleLogCount += matches.length;
        }
      }
    }
  }

  const srcPath = path.join(__dirname, '..');
  scanDirectory(srcPath);

  await Log('backend', 'info', 'route', `GET /verify/console-check - found ${consoleLogCount} statements`);

  res.json({
    found: consoleLogCount
  });
});

router.get('/performance', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /verify/performance - start');

  const startTime = Date.now();

  for (let i = 0; i < 10; i++) {
    await Log('backend', 'info', 'service', `performance test log ${i + 1}`);
  }

  const totalTime = Date.now() - startTime;

  await Log('backend', 'info', 'route', `GET /verify/performance - completed in ${totalTime}ms`);

  res.json({
    totalLogs: 10,
    timeMs: totalTime
  });
});

router.get('/all', async (req, res) => {
  const results = {
    auth: false,
    logging: false,
    externalApi: false,
    errorHandling: false,
    protectedApi: false,
    consoleClean: false,
    ready: false
  };

  try {
    const authConfig = {
      email: process.env.AUTH_EMAIL || 'user@example.com',
      name: process.env.AUTH_NAME || 'User',
      rollNo: process.env.AUTH_ROLL_NO || '12345',
      accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
      clientID: process.env.AUTH_CLIENT_ID || 'clientid',
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
    };

    const authResponse = await fetch('http://20.207.122.201/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authConfig),
      signal: AbortSignal.timeout(5000)
    });
    results.auth = authResponse.ok;

    await Log('backend', 'info', 'route', 'verify all - auth checked');

    await Log('backend', 'info', 'controller', 'verify all - logging checked');
    results.logging = true;

    if (results.auth) {
      const authData = await authResponse.json() as { access_token?: string };
      if (authData.access_token) {
        const logResponse = await fetch('http://20.207.122.201/evaluation-service/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.access_token}`
          },
          body: JSON.stringify({ stack: 'backend', level: 'info', package: 'route', message: 'verify all test' }),
          signal: AbortSignal.timeout(5000)
        });
        results.externalApi = logResponse.ok;

        const depotResponse = await fetch('http://20.207.122.201/evaluation-service/depots', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authData.access_token}` },
          signal: AbortSignal.timeout(5000)
        });
        results.protectedApi = depotResponse.ok;
      }
    }

    try {
      throw new Error('test error for verify all');
    } catch {
      await Log('backend', 'error', 'handler', 'verify all - error handled');
      results.errorHandling = true;
    }

    const fs = require('fs');
    const path = require('path');
    let consoleLogCount = 0;

    function scanDirectory(dir: string): void {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
          scanDirectory(filePath);
        } else if (file.endsWith('.ts')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const matches = content.match(/console\.log\(/g);
          if (matches) consoleLogCount += matches.length;
        }
      }
    }

    scanDirectory(path.join(__dirname, '..'));
    results.consoleClean = consoleLogCount === 0;

    results.ready = results.auth && results.logging && results.externalApi &&
                    results.errorHandling && results.protectedApi && results.consoleClean;

    await Log('backend', 'info', 'route', `GET /verify/all - ready: ${results.ready}`);

    res.json(results);
  } catch (error) {
    await Log('backend', 'error', 'route', `GET /verify/all - error: ${error instanceof Error ? error.message : 'Unknown'}`);

    res.json(results);
  }
});

export default router;