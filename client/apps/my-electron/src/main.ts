import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Suppress CSP security warning in development (unsafe-eval is required for Vite HMR)
if (isDev) {
  const originalWarn = console.warn;
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    if (typeof message === 'string' && 
        message.includes('Electron Security Warning') && 
        message.includes('Content-Security-Policy')) {
      return; // Suppress this specific warning in development
    }
    originalWarn.apply(console, args);
  };
}

let mainWindow: BrowserWindow | null = null;

const MY_APP_BASE_URL = isDev ? 'http://localhost' : `file://${join(__dirname, '../../my-app/dist/index.html')}`;

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 500,
      },
      (res) => {
        // Check if it's a Vite dev server by looking at headers or status
        // Vite typically returns 200 and has specific headers
        const isViteServer = 
          (res.statusCode === 200 || res.statusCode === 304) &&
          (res.headers['content-type']?.includes('text/html') || 
           res.headers['server']?.includes('vite') ||
           res.headers['x-powered-by']?.includes('vite'));
        
        // Also check response body for Vite indicators
        let body = '';
        res.on('data', (chunk) => {
          body += chunk.toString();
          // If we see vite in the HTML, it's likely our app
          if (body.includes('vite') || body.includes('my-app') || body.length > 1000) {
            req.destroy();
            resolve(isViteServer || body.includes('root') || body.includes('React'));
          }
        });
        
        res.on('end', () => {
          resolve(isViteServer || body.includes('root') || body.includes('React'));
        });
      }
    );

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function findMyAppPort(startPort = 3001, maxPort = 3010): Promise<number | null> {
  // Check ports in reverse order (highest first) since Vite uses next available port
  // The most recently started instance will be on the highest port
  for (let port = maxPort; port >= startPort; port--) {
    const isMyApp = await checkPort(port);
    if (isMyApp) {
      return port;
    }
  }
  return null;
}

function waitForServer(url: string, maxAttempts = 30, delay = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const urlObj = new URL(url);
    const checkServer = () => {
      const req = http.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 3001,
          path: urlObj.pathname,
          method: 'GET',
          timeout: 1000,
        },
        (res) => {
          if (res.statusCode === 200 || res.statusCode === 304) {
            resolve();
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error(`Server returned status ${res.statusCode}`));
            } else {
              setTimeout(checkServer, delay);
            }
          }
        }
      );

      req.on('error', (error) => {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error(`Server at ${url} did not become available after ${maxAttempts} attempts: ${error.message}`));
        } else {
          setTimeout(checkServer, delay);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error(`Server at ${url} did not become available after ${maxAttempts} attempts`));
        } else {
          setTimeout(checkServer, delay);
        }
      });

      req.end();
    };
    checkServer();
  });
}

async function createWindow(): Promise<void> {
  // Use the .cjs file (CommonJS) for preload to work with "type": "module" in package.json
  const preloadPath = join(__dirname, 'preload.cjs');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  // Suppress CSP warning in renderer process (unsafe-eval is required for Vite HMR)
  if (isDev) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.executeJavaScript(`
        (function() {
          const originalWarn = console.warn;
          console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('Electron Security Warning') && message.includes('Content-Security-Policy')) {
              return; // Suppress CSP warning in development
            }
            originalWarn.apply(console, args);
          };
        })();
      `).catch(() => {
        // Ignore if execution fails
      });
    });
  }

  // In development, find and wait for my-app dev server
  let myAppUrl = MY_APP_BASE_URL;
  if (isDev) {
    try {
      console.log('Looking for my-app dev server...');
      const port = await findMyAppPort();
      if (port) {
        myAppUrl = `http://localhost:${port}`;
        console.log(`Found my-app at ${myAppUrl}`);
        // Wait a bit more to ensure server is fully ready
        await waitForServer(myAppUrl);
      } else {
        console.error('Could not find my-app dev server on ports 3001-3010');
        console.log('Make sure my-app is running: pnpm dev:my-app');
        myAppUrl = 'http://localhost:3001'; // Fallback, will show error page
      }
    } catch (error) {
      console.error('Failed to connect to my-app dev server:', error);
      console.log('Make sure my-app is running: pnpm dev:my-app');
    }
  }

  // Load my-app
  mainWindow.loadURL(myAppUrl).catch((error) => {
    console.error('Failed to load URL:', error);
    if (isDev) {
      mainWindow?.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui;">
          <h1>Unable to load my-app</h1>
          <p>Please make sure my-app is running:</p>
          <code>pnpm dev:my-app</code>
        </div>';
      `);
    }
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Ensure WebSocket connections are closed when window is closing
  mainWindow.on('close', (event) => {
    // Give a moment for cleanup, but don't prevent close
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        // Close all WebSocket connections
        if (window.__webSocketClients) {
          window.__webSocketClients.forEach(client => {
            if (client && typeof client.deactivate === 'function') {
              try {
                client.deactivate();
              } catch (e) {
                console.error('Error closing WebSocket:', e);
              }
            }
          });
          window.__webSocketClients = [];
        }
      `).catch(() => {
        // Ignore errors during cleanup
      });
    }
  });
}

// Set Content Security Policy
function setupCSP() {
  // In development, allow unsafe-eval for Vite HMR
  // In production, use a stricter policy
  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:* wss://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; frame-ancestors 'none';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws://localhost:* wss://localhost:*; frame-ancestors 'none';";

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  setupCSP();
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay active until the user quits
  // explicitly with Cmd + Q. However, if the user closes all windows, we should
  // also quit the app to ensure the process terminates.
  app.quit();
});

// Ensure the app quits properly
app.on('before-quit', (event) => {
  // Allow the quit to proceed
});

// Force quit if needed
app.on('will-quit', (event) => {
  // Final cleanup can be done here if needed
});

// Handle IPC: close app
ipcMain.handle('app:close', () => {
  app.quit();
});

// Handle app protocol for production builds
if (!isDev) {
  app.setAsDefaultProtocolClient('my-electron');
}

