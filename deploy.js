const fs = require('fs')
const path = require('node:path');
const prompt = require('prompt-sync')();
const environments = require('./environments.json');
const cliProgress = require('cli-progress');
const args = process.argv.slice(2);

require('dotenv').config({ path: __dirname + '/.env' });

// user did not pass a env
if (!args[0]) {
    console.log('Error: Please provide an environment to deploy to or a flag');
    process.exit(1);
}

let passedEnv = args[0].toLowerCase();
if (passedEnv === 'p') { // user chooses from list
    Object.keys(environments).map((env, i) => {
        console.log(`${i + 1}. ${env}`)
    })
    choice = prompt('Environment: ');
    passedEnv = (Object.keys(environments)[Number(choice) - 1])
}

else if (passedEnv === 'ls') { // list all available environments
    console.log(Object.keys(environments).join('\n'));
    process.exit(0);
}

else if (passedEnv === 'ls-full') { // list all available environments
    Object.keys(environments).map((env, i) => {
        console.log(`${env}: ${environments[env]}`)
    })
    process.exit(0);
}

else if (passedEnv === 'add') { // add a new environment
    const tag = prompt('Environment Tag: ');
    const url = prompt('Environment URL: ');

    let data = fs.readFileSync(`${__dirname}/environments.json`)
    let json = JSON.parse(data)
    json[tag] = url

    const newData = JSON.stringify(json);
    fs.writeFileSync(`${__dirname}/environments.json`, newData)
    console.log('Environment added successfully');
    process.exit(0);
}

else if (passedEnv === 'rm') { // add a new environment
    const tag = prompt('Environment to remove: ');

    let data = fs.readFileSync(`${__dirname}/environments.json`)
    let json = JSON.parse(data)
    delete json[tag]

    const newData = JSON.stringify(json);
    fs.writeFileSync(`${__dirname}/environments.json`, newData)
    console.log('Environment removed successfully');
    process.exit(0);
}

else if (passedEnv === 'help') { // list all available commands
    console.log('p: Choose from list');
    console.log('ls: List all available environments');
    console.log('ls-full: List all available environments with URLs');
    console.log('add: Add a new environment');
    console.log('rm: Remove an environment');
    console.log('help: List all available commands');
    process.exit(0);

}

// env not in environment map
if (!environments[passedEnv]) {
    console.log('Error: The environment provided is not valid');
    process.exit(1);
}

const headers = new Headers();
headers.append("Authorization", `Basic ${process.env.FULL_AUTH}`);
const requestOptions = {
    method: "POST",
    headers: headers,
    redirect: "follow"
};

///lastBuild/api/json

const delay = ms => new Promise(res => setTimeout(res, ms));

fetch(`${environments[passedEnv]}/build?delay=0sec`, requestOptions)
    .then(async (res) => {
        if (res.status == 401) {
            console.log(`Failed to trigger build with error:  ${res.statusText} (Code ${res.status})`);
        }
        else if (res.status == 201) {
            console.log("Build triggered successfully");

            const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            let count = 0
            const start = Date.now();
            let timeCount = 0
            while (true) {
                await delay(3000);
                const res = await fetch(`${environments[passedEnv]}lastBuild/api/json`, requestOptions)
                const data = await res.json()
                const status = data.result

                if (count == 0) {
                    bar1.start(Math.floor(data.estimatedDuration / 1000), 0);
                    count++;
                }
                const diff = Math.floor((Date.now() - (start + timeCount)) / 1000);
                timeCount += diff
                bar1.update(diff);


                if (status) {
                    bar1.stop()
                    console.log(`Build Complete: ${status}`);
                    break;
                }
            }

        }
    })
    .catch((error) => {
        console.log("Failed to trigger build with error: ", error);
    });

