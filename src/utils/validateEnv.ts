/**
 * Validates that all required environment variables are present and valid
 * @throws Error if any required environment variable is missing
 */
export function validateEnvironment(): void {
  const requiredEnvVars = [
    'VITE_AZURE_CLIENT_ID',
    'VITE_AZURE_TENANT_ID',
    'VITE_AZURE_REDIRECT_URI',
  ];

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = import.meta.env[envVar];
    
    if (!value) {
      missing.push(envVar);
    } else if (typeof value !== 'string' || value.trim() === '') {
      invalid.push(envVar);
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errors: string[] = [];
    
    if (missing.length > 0) {
      errors.push(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    if (invalid.length > 0) {
      errors.push(`Invalid environment variables: ${invalid.join(', ')}`);
    }
    
    errors.push('\nPlease check your .env file and ensure all required variables are set.');
    errors.push('Required variables:');
    requiredEnvVars.forEach(v => errors.push(`  - ${v}`));
    
    throw new Error(errors.join('\n'));
  }

  // Validate GUID format for Client ID and Tenant ID
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
  
  if (!guidRegex.test(clientId)) {
    throw new Error(`VITE_AZURE_CLIENT_ID is not a valid GUID: ${clientId}`);
  }
  
  if (!guidRegex.test(tenantId)) {
    throw new Error(`VITE_AZURE_TENANT_ID is not a valid GUID: ${tenantId}`);
  }

  // Validate Redirect URI format
  const redirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI;
  try {
    new URL(redirectUri);
  } catch {
    throw new Error(`VITE_AZURE_REDIRECT_URI is not a valid URL: ${redirectUri}`);
  }

  console.log('✅ Environment variables validated successfully');
}
