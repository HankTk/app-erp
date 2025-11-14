const { contextBridge, ipcRenderer } = require('electron');

// Suppress CSP security warning (unsafe-eval is required for Vite HMR in development)
// This warning is expected in development and will not appear in production builds
// Note: We always suppress here since the warning only appears in development anyway
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('Electron Security Warning') && message.includes('Content-Security-Policy')) {
    return; // Suppress CSP warning
  }
  originalWarn.apply(console, args);
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.invoke('app:close'),
});

