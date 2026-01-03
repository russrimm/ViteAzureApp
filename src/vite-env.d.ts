/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Azure - supports both VITE_ prefixed and non-prefixed
  readonly VITE_AZURE_CLIENT_ID?: string;
  readonly AZURE_CLIENT_ID?: string;
  readonly VITE_AZURE_TENANT_ID?: string;
  readonly AZURE_TENANT_ID?: string;
  readonly VITE_AZURE_CLIENT_SECRET?: string;
  readonly AZURE_CLIENT_SECRET?: string;
  readonly VITE_AZURE_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
