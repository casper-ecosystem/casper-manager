# Knowledge Base

## Why I don't have a confirmation window when the user want to sign a deploy ?

The snap check if the deploy is valid by using the Casper JS SDK.
You should check if your deploy is valid with [this function](https://casper-ecosystem.github.io/casper-js-sdk/functions/DeployUtil.validateDeploy.html) before sending it to the Snap.
Otherwise, the deploy will rejected directly without any confirmation window for the user.
