require('dotenv').config();
const fs = require('fs')
const path = require('node:path');
const prompt = require('prompt-sync')();
const environments = require('./environments.json');
const args = process.argv.slice(2);


console.log()
// user did not pass a env
if (!args[0]) {
    console.log('\nError: Please provide an environment to deploy to or a flag');
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
    console.log('\nError: The environment provided is not valid');
    process.exit(1);
}

const headers = new Headers();
headers.append("Authorization", `Basic ${process.env.FULL_AUTH}`);
const requestOptions = {
    method: "POST",
    headers: headers,
    redirect: "follow"
};

fetch(`${environments[passedEnv]}/build?delay=0sec`, requestOptions)
    .then((response) => response.text)
    .then((result) => {
        console.log("\nBuild triggered successfully");
    })
    .catch((error) => {
        console.log("\nFailed to trigger build with error: ", error);
    });

