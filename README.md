# Azure DevOps task utils
Library with useful functionalities for azure devops tasks

- Create client
- Update variable
- etc

````
import * as common from 'azure-devops-task-utils';
import * as nodeApi from 'azure-devops-node-api';

async function sample() {

    common.banner('Init Configuration');
    common.heading('Title');


    const webApi: nodeApi.WebApi = await common.getWebApi();
    const gitApi: GitApi.IGitApi = await webApi.getGitApi();
    const project: string = common.getProject();

    ///
    gitApi.
    .
    .
    .
}


````

To do local tests export the variable with a personal access token

export SYSTEM_ACCESSTOKEN_LOCAL=xxxxx

Nota: In Azure DevOps you must activate the option to use auth script in the agents

"Allow scripts to access the OAuth token"