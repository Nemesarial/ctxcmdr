#!/usr/bin/env node

const inq = require('enquirer')
const { execSync } = require('child_process')
const path = require('path')

inq.prompt([
    {
        type: 'input',
        name: 'command',
        message: 'What is the command folder name (and subsequently your executable command)?',
        default: 'dev'
    }
]).then(a => {
    let command = `ln -s ${path.resolve(__dirname, 'index.js')} /usr/local/bin/${a.command}`
    try {
        execSync(command, { stdio: 'inherit' })
    } catch (e) {
        // console.log(e)
    }
    console.log('installed')
})
