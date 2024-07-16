# jenkins-deploy

## CLI tool to run Jenkins Deployments

To use, first create and configure the environments.json file using 
`sh deploy.sh add` \
\
You will be prompted for a **Tag** and **URL** \
**Tag** - This is the flag you pass to specify what environment you want to deploy to \
**URL** - The URL to the Jenkins deployment

`sh deploy.sh [Tag]` - Run a deployment the use \
`sh deploy.sh add` - Add an environment \
`sh deploy.sh remove` - Remove an environment \
`sh deploy.sh p` - List all environments and choose one to deploy \
`sh deploy.sh [ls or ls-full]` - List added environments \
`sh deploy.sh help` - List all commands
