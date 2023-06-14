import { ConfigurationVariableValue, Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { createWebApi, setReleaseVariableFromApi } from '../src/api';
import { getProject, getVariableRequired, getWebApi, isVariable, setReleaseVariable } from '../src/task';
import { getVariable, setVariable } from 'azure-pipelines-task-lib';

jest.mock('azure-pipelines-task-lib');
jest.mock('../src/api');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isVariable', () => {
  it('should return true if the variable exists', () => {
    const mockVariableName = 'VAR_NAME';
    (getVariable as jest.Mock).mockReturnValue('some value');

    const result = isVariable(mockVariableName);

    expect(getVariable).toHaveBeenCalledWith(mockVariableName);
    expect(result).toBe(true);
  });

  it('should return false if the variable does not exist', () => {
    const mockVariableName = 'VAR_NAME';
    (getVariable as jest.Mock).mockReturnValue(undefined);

    const result = isVariable(mockVariableName);

    expect(getVariable).toHaveBeenCalledWith(mockVariableName);
    expect(result).toBe(false);
  });
});

describe('getVariableRequired', () => {
  it('should return the variable value if it exists', () => {
    const mockVariableName = 'VAR_NAME';
    const mockVariableValue = 'some value';
    (getVariable as jest.Mock).mockReturnValue(mockVariableValue);
    console.log = jest.fn();
    console.error = jest.fn();

    const result = getVariableRequired(mockVariableName);

    expect(getVariable).toHaveBeenCalledWith(mockVariableName);
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(result).toBe(mockVariableValue);
  });

  it('should log an error and throw an error if the variable does not exist', () => {
    const mockVariableName = 'VAR_NAME';
    (getVariable as jest.Mock).mockReturnValue(undefined);
    console.log = jest.fn();
    console.error = jest.fn();

    expect(() => getVariableRequired(mockVariableName)).toThrowError('Variable required: VAR_NAME');
    expect(getVariable).toHaveBeenCalledWith(mockVariableName);
    expect(console.log).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should log a custom message if provided and the variable does not exist', () => {
    const mockVariableName = 'VAR_NAME';
    const mockCustomMessage = 'Custom message';
    (getVariable as jest.Mock).mockReturnValue(undefined);
    console.log = jest.fn();
    console.error = jest.fn();

    expect(() => getVariableRequired(mockVariableName, mockCustomMessage)).toThrowError('Variable required: VAR_NAME');
    expect(getVariable).toHaveBeenCalledWith(mockVariableName);
    expect(console.log).toHaveBeenCalledWith(mockCustomMessage);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('getProject', () => {
  it('should return the project ID', () => {
    const mockProjectId = 'PROJECT_ID';
    (getVariable as jest.Mock).mockReturnValue(mockProjectId);

    const result = getProject();

    expect(getVariable).toHaveBeenCalledWith('SYSTEM_TEAMPROJECTID');
    expect(result).toBe(mockProjectId);
  });
});

describe('getWebApi', () => {
  it('should create a WebApi instance', () => {
    const mock = 'mock-string';
    (getVariable as jest.Mock).mockReturnValue(mock);
    (createWebApi as jest.Mock).mockReturnValue('mock-web-api');

    const result = getWebApi({});
        
    expect(getVariable).toHaveBeenCalledWith('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');

    expect(createWebApi).toHaveBeenCalledWith(mock, mock, {});
    expect(result).toBe('mock-web-api');
  });
});

describe('setReleaseVariable', () => {
  it('should set the release variable and return the updated release', async () => {
    const mockReleaseId = 1;
    const mockVariableName = 'VAR_NAME';
    const mockVariableValue = 'some value';
    const mockProject = 'PROJECT_ID';
    const mockConfigurationVariable: ConfigurationVariableValue = {
      allowOverride: true,
      isSecret: false,
      value: mockVariableValue
    };
    const mockRelease: Release = {
      variables: {
        [mockVariableName]: {}
      }
    };
    (createWebApi as jest.Mock).mockReturnValue('mock-web-api');
    (getVariable as jest.Mock).mockReturnValue(mockProject);
    (setVariable as jest.Mock).mockReturnValue(undefined);
    (setReleaseVariableFromApi as jest.Mock).mockReturnValue(mockRelease);

    const result = await setReleaseVariable(mockReleaseId, mockVariableName, mockVariableValue);

    expect(createWebApi).toHaveBeenCalled();
    expect(getVariable).toHaveBeenCalled();
    expect(setVariable).toHaveBeenCalledWith(mockVariableName, mockVariableValue, false);
    expect(setReleaseVariableFromApi).toHaveBeenCalledWith(
      'mock-web-api',
      mockProject,
      mockReleaseId,
      mockVariableName,
      mockConfigurationVariable
    );
    expect(result).toBe(mockRelease);
  });

  it('should throw an error if an exception occurs', async () => {
    const mockReleaseId = 1;
    const mockVariableName = 'VAR_NAME';
    const mockVariableValue = 'some value';
    const mockError = new Error('Error setting release variable');
    (createWebApi as jest.Mock).mockReturnValue('mock-web-api');
    (getVariable as jest.Mock).mockReturnValue('PROJECT_ID');
    (setVariable as jest.Mock).mockReturnValue(undefined);
    (setReleaseVariableFromApi as jest.Mock).mockRejectedValue(mockError);

    await expect(() => setReleaseVariable(mockReleaseId, mockVariableName, mockVariableValue)).rejects.toThrowError(
      mockError
    );

    expect(createWebApi).toHaveBeenCalled();
    expect(getVariable).toHaveBeenCalled();
    expect(setVariable).toHaveBeenCalledWith(mockVariableName, mockVariableValue, false);
    expect(setReleaseVariableFromApi).toHaveBeenCalledWith(
      'mock-web-api',
      'PROJECT_ID',
      mockReleaseId,
      mockVariableName,
      {
        allowOverride: true,
        isSecret: false,
        value: mockVariableValue
      }
    );
  });
});
