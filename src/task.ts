import { ConfigurationVariableValue, Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { debug, getVariable, setVariable } from 'azure-pipelines-task-lib';

import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';
import { IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { WebApi } from 'azure-devops-node-api';
import { createWebApi } from './api';

export function isVariable(name: string): boolean {
  return !!getVariable(name);
}

export function getVariableRequired(name: string, customMessage?: string): string {
  const value: string = getVariable(name) as string;
  if (!value) {
    console.log(customMessage);
    console.error(name + ' env var not set. It is not found in the agent variables');
    throw new Error(`Variable required: ${name}`);
  }
  debug(`${name} = ${value}`);
  return value;
}

export function getProject(): string {
  return getVariableRequired('SYSTEM_TEAMPROJECTID');
}

export function getWebApi(apiOptions?: IRequestOptions): WebApi {
  const serverUrl: string = getVariableRequired('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');
  const token: string = getVariableRequired(
    'SYSTEM_ACCESSTOKEN',
    'Remember to enable in the agent "Allow scripts to access the OAuth token"'
  );
  return createWebApi(serverUrl, token, apiOptions);
}

export async function setReleaseVariable(
  releaseId: number,
  variableName: string,
  variableValue: string,
  allowOverride: boolean = true,
  isSecret: boolean = false
): Promise<Release> {
  try {
    const webApi: WebApi = getWebApi();
    const releaseApi: IReleaseApi = await webApi.getReleaseApi();
    const project: string = getProject();
    setVariable(variableName, variableValue);
    const release: Release = await releaseApi.getRelease(project, releaseId);

    const variableConfiguration: ConfigurationVariableValue = {
      allowOverride,
      isSecret,
      value: variableValue
    };

    if (release.variables) {
      release.variables[variableName] = variableConfiguration;
      return await releaseApi.updateRelease(release, project, Number(releaseId));
    } else {
      throw new Error('Variables is undefined');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
