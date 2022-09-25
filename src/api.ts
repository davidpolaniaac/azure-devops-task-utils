import { ConfigurationVariableValue, Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { WebApi, getHandlerFromToken } from 'azure-devops-node-api';

import { ConnectionData } from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';
import { IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';

export async function testConnection(webApi: WebApi): Promise<ConnectionData> {
  const connData: ConnectionData = await webApi.connect();
  const name = connData && connData.authenticatedUser && connData.authenticatedUser.providerDisplayName;
  console.log(`Hello ${name}`);
  return connData;
}

export function createWebApi(serverUrl: string, token: string, apiOptions?: IRequestOptions): WebApi {
  try {
    const authHandler = getHandlerFromToken(token);
    const webApi: WebApi = new WebApi(serverUrl, authHandler, apiOptions);
    return webApi;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function setReleaseVariableFromApi(
  webApi: WebApi,
  project: string,
  releaseId: number,
  variableName: string,
  configurationVariable: ConfigurationVariableValue
): Promise<Release> {
  try {
    const releaseApi: IReleaseApi = await webApi.getReleaseApi();
    const release: Release = await releaseApi.getRelease(project, releaseId);

    if (release.variables) {
      release.variables[variableName] = configurationVariable;
      return await releaseApi.updateRelease(release, project, Number(releaseId));
    } else {
      throw new Error('Variables is undefined');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
