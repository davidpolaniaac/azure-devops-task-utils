# Azure DevOps task utils
Library with useful functionalities for azure devops tasks

- Create client
- Update variable
- retries
- etc

# Usage

```sh-session
$ npm install --save azure-devops-task-utils
...

```

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

To do local tests export the variables y en la variable 'SYSTEM_ACCESSTOKEN' a personal access token

export SYSTEM_ACCESSTOKEN=xxxxx

export SYSTEM_TEAMPROJECTID=xxxxx-xxx-xx

export SYSTEM_TEAMFOUNDATIONCOLLECTIONURI=https://dev.azure.com/xxxxxxxx/

Nota: In Azure DevOps you must activate the option to use auth script in the agents

"Allow scripts to access the OAuth token"