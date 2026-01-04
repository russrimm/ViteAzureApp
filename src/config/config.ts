/**
 * Configuration file for the application
 * This centralizes all configuration values in one place
 */

// Export a config object that other files can import and use
export const config = {
  azure: {
    // Azure AD Client ID - uniquely identifies this app in Azure
    // import.meta.env reads from environment variables (.env file)
    // The || '' means "use empty string if the variable is not set"
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    
    // Azure AD Tenant ID - identifies your organization in Azure
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    
    // Client Secret - like a password for the app (not used in frontend, but kept for reference)
    clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET || '',
    
    // Redirect URI - where Azure sends users after they log in
    // Defaults to the current website's URL (e.g., http://localhost:5173)
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}`,
  },
};
