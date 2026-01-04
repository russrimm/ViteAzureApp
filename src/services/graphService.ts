/**
 * GraphService - Microsoft Graph API Service
 * 
 * This service handles all interactions with Microsoft Graph API, which provides access to:
 * - User authentication (logging in/out)
 * - User profile data
 * - Temporary Access Pass (TAP) generation
 * - Service principal and permission management
 * 
 * The service uses:
 * - MSAL (Microsoft Authentication Library) for handling user login
 * - Microsoft Graph Client for making API calls to Microsoft's cloud services
 */

import { AccountInfo, InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { config } from '../config/config';

// TypeScript interfaces define the shape of data we receive from the API

/**
 * UserProfile Interface
 * Represents a user's profile information from Azure AD
 */
export interface UserProfile {
  id: string;                // Unique identifier for the user
  displayName: string;       // Full name (e.g., "John Doe")
  mail: string;              // Email address
  userPrincipalName: string; // Login username (usually email)
  jobTitle?: string;         // Job title (optional, ? means it might not exist)
  department?: string;       // Department name (optional)
  mobilePhone?: string;      // Phone number (optional)
  officeLocation?: string;   // Office location (optional)
}

/**
 * UpdateUserProfileData Interface
 * Defines which fields can be updated on a user profile
 */
export interface UpdateUserProfileData {
  displayName?: string;
  jobTitle?: string;
  department?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

/**
 * TemporaryAccessPass Interface
 * Represents a temporary password that can be used for authentication
 */
export interface TemporaryAccessPass {
  temporaryAccessPass: string;  // The actual password string
  lifetimeInMinutes: number;    // How long it's valid (e.g., 60 minutes)
  isUsableOnce: boolean;        // If true, can only be used once
}

/**
 * GraphService Class
 * 
 * This class manages:
 * 1. Authentication with Microsoft using MSAL
 * 2. Making API calls to Microsoft Graph
 * 3. Handling access tokens and permissions
 */
class GraphService {
  // Private properties (only accessible within this class)
  private msalInstance: PublicClientApplication;  // Handles Microsoft login
  private graphClient: Client | null = null;      // Makes API calls (null until we log in)
  private initPromise: Promise<void>;             // Tracks initialization status

  /**
   * Constructor - runs once when the service is created
   * Sets up the Microsoft authentication library (MSAL)
   */
  constructor() {
    // Create MSAL instance with our Azure AD app credentials
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: config.azure.clientId,        // Our app's ID from Azure
        authority: `https://login.microsoftonline.com/${config.azure.tenantId}`,  // Azure login URL
        redirectUri: config.azure.redirectUri,  // Where to send users after login
      },
      cache: {
        cacheLocation: 'localStorage',    // Store login data in browser's localStorage
        storeAuthStateInCookie: false,    // Don't use cookies (localStorage is more modern)
      },
    });

    // Initialize MSAL (this is asynchronous, so we save the promise)
    this.initPromise = this.msalInstance.initialize();
  }

  /**
   * Ensures MSAL is fully initialized before we try to use it
   * Private method (only used within this class)
   */
  private async ensureInitialized(): Promise<void> {
    await this.initPromise;  // Wait for initialization to complete
  }

  /**
   * Login Method
   * 
   * Opens a popup window for the user to sign in with their Microsoft account
   * Requests specific permissions (scopes) that our app needs
   * 
   * @returns Promise<AccountInfo> - Information about the logged-in user
   * @throws Error if login fails
   */
  async login(): Promise<AccountInfo> {
    try {
      await this.ensureInitialized();  // Make sure MSAL is ready
      
      // Open login popup and request permissions
      // Scopes are the permissions our app needs (like reading user profiles)
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: [
          'User.Read',                  // Read basic user info
          'User.ReadWrite',             // Read and update user info
          'User.ReadBasic.All',         // Read basic info for all users
          'UserAuthenticationMethod.ReadWrite.All',  // Manage authentication methods (TAP)
          'Application.Read.All',        // Read application info
          'Application.ReadWrite.All',   // Read and write application info
          'AppRoleAssignment.ReadWrite.All',  // Manage permission assignments
        ],
      });

      return loginResponse.account;  // Return info about the logged-in user
    } catch (error) {
      console.error('Login failed:', error);
      throw error;  // Re-throw so calling code can handle it
    }
  }

  /**
   * Logout Method
   * 
   * Signs the user out of their Microsoft account
   * Opens a popup to complete the logout process
   */
  async logout(): Promise<void> {
    await this.ensureInitialized();
    const currentAccount = this.msalInstance.getAllAccounts()[0];  // Get current user
    if (currentAccount) {
      await this.msalInstance.logoutPopup({
        account: currentAccount,
      });
    }
  }

  /**
   * getAccount Method
   * 
   * Checks if there's a user currently logged in
   * 
   * @returns AccountInfo | null - User info if logged in, null otherwise
   */
  getAccount(): AccountInfo | null {
    // Note: getAccount is synchronous, so it assumes MSAL is already initialized
    const accounts = this.msalInstance.getAllAccounts();  // Get all logged-in accounts
    return accounts.length > 0 ? accounts[0] : null;      // Return first account or null
  }

  /**
   * isAuthenticated Method
   * 
   * Simple check: is anyone logged in?
   * 
   * @returns boolean - true if user is logged in, false otherwise
   */
  isAuthenticated(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }

  /**
   * getAccessToken Method (Private)
   * 
   * Gets an access token from Microsoft to authorize API calls
   * Access tokens are like temporary passwords that prove we have permission
   * 
   * Process:
   * 1. Try to get token silently (without user interaction)
   * 2. If that fails, show a popup to get user consent
   * 
   * @returns Promise<string> - The access token
   * @throws Error if no user is logged in or token can't be obtained
   */
  private async getAccessToken(): Promise<string> {
    await this.ensureInitialized();
    
    const account = this.getAccount();
    if (!account) {
      throw new Error('No active account. Please log in first.');
    }

    try {
      // Try to get token silently (user won't see anything)
      const response = await this.msalInstance.acquireTokenSilent({
        scopes: [
          'User.Read',
          'User.ReadWrite',
          'UserAuthenticationMethod.ReadWrite.All',
          'Application.Read.All',
          'Application.ReadWrite.All',
          'AppRoleAssignment.ReadWrite.All',
        ],
        account,
      });

      return response.accessToken;
    } catch (error) {
      // If silent token acquisition fails (e.g., token expired, consent needed)
      if (error instanceof InteractionRequiredAuthError) {
        // Show popup to get user consent
        const response = await this.msalInstance.acquireTokenPopup({
          scopes: [
            'User.Read',
            'User.ReadWrite',
            'UserAuthenticationMethod.ReadWrite.All',
            'Application.Read.All',
            'Application.ReadWrite.All',
            'AppRoleAssignment.ReadWrite.All',
          ],
          account,
        });
        return response.accessToken;
      }
      throw error;  // If it's a different error, re-throw it
    }
  }

  /**
   * getGraphClient Method (Private)
   * 
   * Creates or returns the Microsoft Graph client that we use to make API calls
   * The client is created once and reused for efficiency
   * 
   * @returns Promise<Client> - The Microsoft Graph client
   */
  private async getGraphClient(): Promise<Client> {
    // If we already have a client, return it
    if (!this.graphClient) {
      // Otherwise, create a new one
      const accessToken = await this.getAccessToken();  // Get token first
      
      // Initialize the Graph client with our token
      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);  // Provide token to the client
        },
      });
    }
    return this.graphClient;
  }

  // ==========================================
  // USER PROFILE METHODS
  // Methods for reading and updating user information
  // ==========================================

  /**
   * getCurrentUserProfile Method
   * 
   * Gets the profile of the currently logged-in user
   * 
   * @returns Promise<UserProfile> - The user's profile data
   * @throws Error if the API call fails
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const client = await this.getGraphClient();  // Get authenticated client
      // Call the /me endpoint (always returns current user's info)
      const user = await client.api('/me').get();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * getUserProfile Method
   * 
   * Gets the profile of a specific user by their ID
   * 
   * @param userId - The unique ID of the user
   * @returns Promise<UserProfile> - The user's profile data
   * @throws Error if the API call fails
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const client = await this.getGraphClient();
      // Call /users/{id} to get a specific user's info
      const user = await client.api(`/users/${userId}`).get();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * updateUserProfile Method
   * 
   * Updates a user's profile information
   * Only updates the fields provided in the data parameter
   * 
   * @param userId - The unique ID of the user to update
   * @param data - Object containing the fields to update
   * @returns Promise<void> - Completes when update is done
   * @throws Error if the API call fails
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<void> {
    try {
      const client = await this.getGraphClient();
      // PATCH request updates only the fields we send
      await client.api(`/users/${userId}`).patch(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * searchUsers Method
   * 
   * Searches for users whose name or email starts with the search term
   * Returns up to 10 matching users
   * 
   * @param searchTerm - Text to search for (e.g., "John" or "john@")
   * @returns Promise<UserProfile[]> - Array of matching users
   * @throws Error if the API call fails
   */
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const client = await this.getGraphClient();
      // Use filter query to search by name or email
      // top(10) limits results to 10 users
      const result = await client
        .api('/users')
        .filter(`startsWith(displayName,'${searchTerm}') or startsWith(userPrincipalName,'${searchTerm}')`)
        .top(10)
        .get();

      return result.value;  // API returns results in a 'value' property
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // ==========================================
  // TEMPORARY ACCESS PASS (TAP) METHODS
  // Methods for creating and managing temporary passwords
  // ==========================================

  /**
   * createTemporaryAccessPass Method
   * 
   * Creates a temporary password for a user
   * This is useful when users forget their password or need a one-time login
   * 
   * @param userId - The unique ID of the user who needs a TAP
   * @param lifetimeInMinutes - How long the TAP is valid (default: 60 minutes)
   * @param isUsableOnce - If true, TAP can only be used once (default: true)
   * @returns Promise<TemporaryAccessPass> - The created TAP with password string
   * @throws Error if permission is denied or API call fails
   */
  async createTemporaryAccessPass(
    userId: string,
    lifetimeInMinutes: number = 60,
    isUsableOnce: boolean = true
  ): Promise<TemporaryAccessPass> {
    try {
      const client = await this.getGraphClient();
      
      // Prepare the data for the API request
      const tapData = {
        lifetimeInMinutes,
        isUsableOnce,
      };

      // POST request to create a TAP for the user
      const result = await client
        .api(`/users/${userId}/authentication/temporaryAccessPassMethods`)
        .post(tapData);

      return result;
    } catch (error: any) {
      console.error('Error creating Temporary Access Pass:', error);
      
      // Provide helpful error messages based on the type of error
      if (error.statusCode === 403) {
        throw new Error('Permission denied. The app needs "UserAuthenticationMethod.ReadWrite.All" permission with admin consent. Please contact your Azure AD administrator.');
      } else if (error.statusCode === 401) {
        throw new Error('Authentication failed. Please sign out and sign back in to refresh your permissions.');
      } else if (error.message) {
        throw new Error(`Failed to generate TAP: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * getTemporaryAccessPassMethods Method
   * 
   * Gets all TAP methods configured for a user
   * Shows existing TAPs (but not the actual passwords, for security)
   * 
   * @param userId - The unique ID of the user
   * @returns Promise<any[]> - Array of TAP methods
   * @throws Error if the API call fails
   */
  async getTemporaryAccessPassMethods(userId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const result = await client
        .api(`/users/${userId}/authentication/temporaryAccessPassMethods`)
        .get();

      return result.value;
    } catch (error) {
      console.error('Error fetching TAP methods:', error);
      throw error;
    }
  }

  // ==========================================
  // SERVICE PRINCIPAL & PERMISSION MANAGEMENT METHODS
  // Methods for managing app permissions and service principals
  // These are advanced admin functions
  // ==========================================

  /**
   * grantAppRoleToServicePrincipal Method
   * 
   * Grants a Microsoft Graph permission to a service principal (like a Logic App's managed identity)
   * This is an admin function used to give apps permission to call Microsoft Graph APIs
   * 
   * Process:
   * 1. Find Microsoft Graph's service principal
   * 2. Find the specific permission (app role) by name
   * 3. Grant that permission to the target service principal
   * 
   * @param servicePrincipalObjectId - The object ID of the service principal to grant permission to
   * @param appRoleName - The name of the permission (e.g., 'UserAuthenticationMethod.ReadWrite.All')
   * @returns Promise<any> - The created role assignment
   * @throws Error if permission is denied or role assignment fails
   */
  async grantAppRoleToServicePrincipal(
    servicePrincipalObjectId: string,
    appRoleName: string = 'UserAuthenticationMethod.ReadWrite.All'
  ): Promise<any> {
    try {
      const client = await this.getGraphClient();
      
      // First, get Microsoft Graph's service principal to find the app role ID
      // Microsoft Graph App ID is always: 00000003-0000-0000-c000-000000000000
      const graphSP = await client
        .api('/servicePrincipals')
        .filter("appId eq '00000003-0000-0000-c000-000000000000'") // Microsoft Graph App ID
        .get();

      if (!graphSP.value || graphSP.value.length === 0) {
        throw new Error('Microsoft Graph service principal not found');
      }

      const graphServicePrincipal = graphSP.value[0];
      
      // Find the specific app role by value (name)
      // App roles are the available permissions (like 'User.Read', 'Mail.Send', etc.)
      const appRole = graphServicePrincipal.appRoles.find(
        (role: any) => role.value === appRoleName
      );

      if (!appRole) {
        throw new Error(`App role '${appRoleName}' not found`);
      }

      // Grant the app role to the target service principal
      // This is like saying: "This app now has permission to do X"
      const body = {
        principalId: servicePrincipalObjectId,    // Who gets the permission
        resourceId: graphServicePrincipal.id,     // What they get permission to (Microsoft Graph)
        appRoleId: appRole.id                     // Which specific permission
      };

      const result = await client
        .api(`/servicePrincipals/${servicePrincipalObjectId}/appRoleAssignments`)
        .post(body);

      return result;
    } catch (error: any) {
      console.error('Error granting app role:', error);
      
      // Provide helpful error messages
      if (error.statusCode === 403) {
        throw new Error('Permission denied. You need "Application.ReadWrite.All" and "AppRoleAssignment.ReadWrite.All" permissions to grant permissions to service principals.');
      } else if (error.statusCode === 400 && error.message?.includes('already exists')) {
        throw new Error('This permission has already been granted to the service principal.');
      } else if (error.message) {
        throw new Error(`Failed to grant permission: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * getServicePrincipalInfo Method
   * 
   * Gets detailed information about a service principal
   * \n   * @param objectId - The object ID of the service principal
   * @returns Promise<any> - Service principal information
   * @throws Error if not found or permission denied
   */
  async getServicePrincipalInfo(objectId: string): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const sp = await client
        .api(`/servicePrincipals/${objectId}`)
        .select('id,appId,displayName,appRoles,appRoleAssignments')  // Only get fields we need
        .get();

      return sp;
    } catch (error: any) {
      console.error('Error fetching service principal:', error);
      
      if (error.statusCode === 404) {
        throw new Error('Service principal not found. Please verify the object ID.');
      } else if (error.statusCode === 403) {
        throw new Error('Permission denied. You need "Application.Read.All" permission.');
      }
      
      throw error;
    }
  }

  /**
   * getServicePrincipalAppRoleAssignments Method
   * 
   * Gets all permissions (app role assignments) granted to a service principal
   * Also enriches the data with human-readable names for each permission
   * 
   * @param objectId - The object ID of the service principal
   * @returns Promise<any[]> - Array of permission assignments with details
   * @throws Error if permission denied
   */
  async getServicePrincipalAppRoleAssignments(objectId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      
      // Get app role assignments for this service principal
      const result = await client
        .api(`/servicePrincipals/${objectId}/appRoleAssignments`)
        .get();

      // Enrich each assignment with resource and role details
      // This makes the data more useful by adding human-readable names
      const enrichedAssignments = await Promise.all(
        (result.value || []).map(async (assignment: any) => {
          try {
            // Get the resource service principal (e.g., Microsoft Graph)
            const resource = await client
              .api(`/servicePrincipals/${assignment.resourceId}`)
              .select('displayName,appRoles')
              .get();

            // Find the specific app role to get its name and description
            const appRole = resource.appRoles?.find(
              (role: any) => role.id === assignment.appRoleId
            );

            // Return assignment with added details
            return {
              ...assignment,
              resourceDisplayName: resource.displayName,           // e.g., "Microsoft Graph"
              appRoleValue: appRole?.value || 'Unknown',           // e.g., "User.Read"
              appRoleDisplayName: appRole?.displayName || 'Unknown',  // e.g., "Read user profiles"
              appRoleDescription: appRole?.description || '',      // Detailed description
            };
          } catch (err) {
            console.error('Error enriching assignment:', err);
            return assignment;  // Return original if enrichment fails
          }
        })
      );

      return enrichedAssignments;
    } catch (error: any) {
      console.error('Error fetching app role assignments:', error);
      
      if (error.statusCode === 403) {
        throw new Error('Permission denied. You need "Application.Read.All" permission.');
      }
      
      throw error;
    }
  }

  /**
   * listServicePrincipals Method
   * 
   * Gets a list of all service principals in the Azure AD tenant
   * Limited to 999 results for performance
   * 
   * @returns Promise<any[]> - Array of service principals
   * @throws Error if permission denied
   */
  async listServicePrincipals(): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const result = await client
        .api('/servicePrincipals')
        .select('id,appId,displayName,servicePrincipalType,tags')  // Only get fields we need
        .top(999)  // Limit to 999 results
        .get();

      return result.value || [];
    } catch (error: any) {
      console.error('Error listing service principals:', error);
      
      if (error.statusCode === 403) {
        throw new Error('Permission denied. You need "Application.Read.All" permission to list service principals.');
      }
      
      throw error;
    }
  }

  /**
   * listManagedIdentities Method
   * 
   * Gets only the managed identities (filters out regular app registrations)
   * Managed identities are service principals for Azure resources like Logic Apps, VMs, etc.
   * 
   * @returns Promise<any[]> - Array of managed identities
   * @throws Error if permission denied
   */
  async listManagedIdentities(): Promise<any[]> {
    try {
      const allServicePrincipals = await this.listServicePrincipals();
      
      // Filter for managed identities only
      // Check for servicePrincipalType === 'ManagedIdentity' OR specific tags
      const managedIdentities = allServicePrincipals.filter(sp => 
        sp.servicePrincipalType === 'ManagedIdentity' ||
        sp.tags?.includes('WindowsAzureActiveDirectoryIntegratedApp')
      );

      return managedIdentities;
    } catch (error: any) {
      console.error('Error listing managed identities:', error);
      throw error;
    }
  }
}

// ==========================================
// EXPORT
// Create a single instance of the service and export it
// This ensures we only have one GraphService instance in the entire app
// (Singleton pattern)
// ==========================================
export const graphService = new GraphService();
