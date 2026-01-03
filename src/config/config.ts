// Environment configuration
export const config = {
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}`,
  },
};
