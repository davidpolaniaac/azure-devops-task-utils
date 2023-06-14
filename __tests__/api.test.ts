import * as azureApi from 'azure-devops-node-api';

import { createWebApi, setReleaseVariableFromApi, testConnection } from '../src/api';

import { ConnectionData } from 'azure-devops-node-api/interfaces/LocationsInterfaces';

jest.mock('azure-devops-node-api');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('testConnection', () => {
  it('should return connection data', async () => {
    const mockName = 'John Doe';
    const mockConnData: ConnectionData = {
      authenticatedUser: {
        providerDisplayName: mockName
      }
    };
    const mockWebApi: any = {
      connect: jest.fn(() => Promise.resolve(mockConnData))
    };

    const logSpy = jest.spyOn(global.console, 'log');

    const result = await testConnection(mockWebApi);
    
    expect(mockWebApi.connect).toHaveBeenCalled();
    expect(result).toBe(mockConnData);
    expect(logSpy).toHaveBeenCalledWith(`Hello ${mockName}`);
  });
});

describe('createWebApi', () => {
  it('should create a WebApi instance', () => {
    const mockServerUrl = 'https://example.com';
    const mockToken = 'mock-token';
    const mockAuthHandler : any = jest.fn();

    const handler = jest.spyOn(azureApi, 'getHandlerFromToken').mockImplementation(() => mockAuthHandler);

    const result = createWebApi(mockServerUrl, mockToken, {});

    expect(handler).toHaveBeenCalledWith(mockToken);
    expect(result).toBeInstanceOf(azureApi.WebApi);
  });

  it('should throw an error if WebApi initialization fails', () => {
    const mockError = new Error('WebApi initialization failed');
    const mockServerUrl = 'https://example.com';
    const mockToken = 'mock-token';

    const handler = jest.spyOn(azureApi, 'getHandlerFromToken').mockImplementation(() => {throw mockError});

    expect(() => createWebApi(mockServerUrl, mockToken, {})).toThrowError(mockError);
    expect(handler).toHaveBeenCalledWith(mockToken);
  });
});

describe('setReleaseVariableFromApi', () => {
  it('should update release variable and return the updated release', async () => {
    const mockProject = 'project';
    const mockReleaseId = 1;
    const mockVariableName = 'variableName';
    const mockConfigurationVariable = { value: 'mock-value' };
    const mockRelease = {
      variables: {
        [mockVariableName]: {}
      }
    };
    const mockReleaseApi = {
      getRelease: jest.fn(() => Promise.resolve(mockRelease)),
      updateRelease: jest.fn(() => Promise.resolve(mockRelease))
    };
    const mockWebApi = {
      getReleaseApi: jest.fn(() => Promise.resolve(mockReleaseApi))
    };

    const result = await setReleaseVariableFromApi(
      mockWebApi as any,
      mockProject,
      mockReleaseId,
      mockVariableName,
      mockConfigurationVariable
    );

    expect(mockWebApi.getReleaseApi).toHaveBeenCalled();
    expect(mockReleaseApi.getRelease).toHaveBeenCalledWith(mockProject, mockReleaseId);
    expect(mockRelease.variables[mockVariableName]).toBe(mockConfigurationVariable);
    expect(mockReleaseApi.updateRelease).toHaveBeenCalledWith(mockRelease, mockProject, mockReleaseId);
    expect(result).toBe(mockRelease);
  });

  it('should throw an error if variables is undefined', async () => {
    const mockProject = 'project';
    const mockReleaseId = 1;
    const mockVariableName = 'variableName';
    const mockConfigurationVariable = { value: 'mock-value' };
    const mockRelease = {};
    const mockReleaseApi = {
      getRelease: jest.fn(() => Promise.resolve(mockRelease))
    };
    const mockWebApi = {
      getReleaseApi: jest.fn(() => Promise.resolve(mockReleaseApi))
    };

    await expect(() =>
      setReleaseVariableFromApi(
        mockWebApi as any,
        mockProject,
        mockReleaseId,
        mockVariableName,
        mockConfigurationVariable
      )
    ).rejects.toThrowError('Variables is undefined');

    expect(mockWebApi.getReleaseApi).toHaveBeenCalled();
    expect(mockReleaseApi.getRelease).toHaveBeenCalledWith(mockProject, mockReleaseId);
  });

  it('should throw an error if release API throws an error', async () => {
    const mockProject = 'project';
    const mockReleaseId = 1;
    const mockVariableName = 'variableName';
    const mockConfigurationVariable = { value: 'mock-value' };
    const mockError = new Error('Release API error');
    const mockReleaseApi = {
      getRelease: jest.fn(() => Promise.reject(mockError))
    };
    const mockWebApi = {
      getReleaseApi: jest.fn(() => Promise.resolve(mockReleaseApi))
    };

    await expect(() =>
      setReleaseVariableFromApi(
        mockWebApi as any,
        mockProject,
        mockReleaseId,
        mockVariableName,
        mockConfigurationVariable
      )
    ).rejects.toThrowError(mockError);

    expect(mockWebApi.getReleaseApi).toHaveBeenCalled();
    expect(mockReleaseApi.getRelease).toHaveBeenCalledWith(mockProject, mockReleaseId);
  });
});
