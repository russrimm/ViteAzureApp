import { AccountInfo, InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { config } from '../config/config';

export interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

export interface UpdateUserProfileData {
  displayName?: string;
  jobTitle?: string;
  department?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

export interface TemporaryAccessPass {
  temporaryAccessPass: string;
  lifetimeInMinutes: number;
  isUsableOnce: boolean;
}

class GraphService {
  private msalInstance: PublicClientApplication;
  private graphClient: Client | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: config.azure.clientId,
        authority: `https://login.microsoftonline.com/${config.azure.tenantId}`,
        redirectUri: config.azure.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });

    this.initPromise = this.msalInstance.initialize();
  }

  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async login(): Promise<AccountInfo> {
    try {
      await this.ensureInitialized();
      
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: [
          'User.Read',
          'User.ReadWrite',
          'User.ReadBasic.All',
          'UserAuthenticationMethod.ReadWrite.All',
          'Application.Read.All',
          'Application.ReadWrite.All',
          'AppRoleAssignment.ReadWrite.All',
        ],
      });

      return loginResponse.account;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.ensureInitialized();
    const currentAccount = this.msalInstance.getAllAccounts()[0];
    if (currentAccount) {
      await this.msalInstance.logoutPopup({
        account: currentAccount,
      });
    }
  }

  getAccount(): AccountInfo | null {
    // Note: getAccount is synchronous, so it assumes MSAL is already initialized
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  isAuthenticated(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }

  private async getAccessToken(): Promise<string> {
    await this.ensureInitialized();
    
    const account = this.getAccount();
    if (!account) {
      throw new Error('No active account. Please log in first.');
    }

    try {
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
      if (error instanceof InteractionRequiredAuthError) {
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
      throw error;
    }
  }

  private async getGraphClient(): Promise<Client> {
    if (!this.graphClient) {
      const accessToken = await this.getAccessToken();
      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
    }
    return this.graphClient;
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const client = await this.getGraphClient();
      const user = await client.api('/me').get();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const client = await this.getGraphClient();
      const user = await client.api(`/users/${userId}`).get();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<void> {
    try {
      const client = await this.getGraphClient();
      await client.api(`/users/${userId}`).patch(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const client = await this.getGraphClient();
      const result = await client
        .api('/users')
        .filter(`startsWith(displayName,'${searchTerm}') or startsWith(userPrincipalName,'${searchTerm}')`)
        .top(10)
        .get();

      return result.value;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async createTemporaryAccessPass(
    userId: string,
    lifetimeInMinutes: number = 60,
    isUsableOnce: boolean = true
  ): Promise<TemporaryAccessPass> {
    try {
      const client = await this.getGraphClient();
      const tapData = {
        lifetimeInMinutes,
        isUsableOnce,
      };

      const result = await client
        .api(`/users/${userId}/authentication/temporaryAccessPassMethods`)
        .post(tapData);

      return result;
    } catch (error: any) {
      console.error('Error creating Temporary Access Pass:', error);
      
      // Provide more specific error messages
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

  async grantAppRoleToServicePrincipal(
    servicePrincipalObjectId: string,
    appRoleName: string = 'UserAuthenticationMethod.ReadWrite.All'
  ): Promise<any> {
    try {
      const client = await this.getGraphClient();
      
      // First, get Microsoft Graph's service principal to find the app role ID
      const graphSP = await client
        .api('/servicePrincipals')
        .filter("appId eq '00000003-0000-0000-c000-000000000000'") // Microsoft Graph App ID
        .get();

      if (!graphSP.value || graphSP.value.length === 0) {
        throw new Error('Microsoft Graph service principal not found');
      }

      const graphServicePrincipal = graphSP.value[0];
      
      // Find the specific app role by value (name)
      const appRole = graphServicePrincipal.appRoles.find(
        (role: any) => role.value === appRoleName
      );

      if (!appRole) {
        throw new Error(`App role '${appRoleName}' not found`);
      }

      // Grant the app role to the target service principal
      const body = {
        principalId: servicePrincipalObjectId,
        resourceId: graphServicePrincipal.id,
        appRoleId: appRole.id
      };

      const result = await client
        .api(`/servicePrincipals/${servicePrincipalObjectId}/appRoleAssignments`)
        .post(body);

      return result;
    } catch (error: any) {
      console.error('Error granting app role:', error);
      
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

  async getServicePrincipalInfo(objectId: string): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const sp = await client
        .api(`/servicePrincipals/${objectId}`)
        .select('id,appId,displayName,appRoles,appRoleAssignments')
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

  async getServicePrincipalAppRoleAssignments(objectId: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      
      // Get app role assignments for this service principal
      const result = await client
        .api(`/servicePrincipals/${objectId}/appRoleAssignments`)
        .get();

      // Enrich with resource and role details
      const enrichedAssignments = await Promise.all(
        (result.value || []).map(async (assignment: any) => {
          try {
            // Get the resource service principal (e.g., Microsoft Graph)
            const resource = await client
              .api(`/servicePrincipals/${assignment.resourceId}`)
              .select('displayName,appRoles')
              .get();

            // Find the specific app role
            const appRole = resource.appRoles?.find(
              (role: any) => role.id === assignment.appRoleId
            );

            return {
              ...assignment,
              resourceDisplayName: resource.displayName,
              appRoleValue: appRole?.value || 'Unknown',
              appRoleDisplayName: appRole?.displayName || 'Unknown',
              appRoleDescription: appRole?.description || '',
            };
          } catch (err) {
            console.error('Error enriching assignment:', err);
            return assignment;
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

  async listServicePrincipals(): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const result = await client
        .api('/servicePrincipals')
        .select('id,appId,displayName,servicePrincipalType,tags')
        .top(999)
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

  async listManagedIdentities(): Promise<any[]> {
    try {
      const allServicePrincipals = await this.listServicePrincipals();
      
      // Filter for managed identities
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

export const graphService = new GraphService();
