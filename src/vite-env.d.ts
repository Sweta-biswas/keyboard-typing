declare module 'react-dom/client';

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
