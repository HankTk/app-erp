/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    closeApp: () => Promise<void>;
  };
  __webSocketClients?: Array<{
    deactivate: () => void;
  }>;
}
