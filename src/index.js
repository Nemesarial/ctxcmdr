#!/usr/bin/env node
const fs = require('fs')

const cwd = process.cwd()
const path = require('path')
const cmd = path.basename(process.argv[1])
const { fork, execFile, execSync } = require('child_process')
const inq = require('enquirer')

const { App, Command, Param, Argument, Flag } = require('@cthru/cmdr')

const callback = (options, app) => {
    if (options['create-script']) {
        let folder = path.resolve(cwd, cmd)
        let command = options['create-script']
        console.log(`Creating command ${path.resolve(folder, command)}`)
        try {
            try { fs.mkdirSync(folder) } catch (e) { console.log(`WARN: ${e.message}`) }
            try { execSync('npm init -y', { cwd: folder, shell: true }) } catch (e) { console.log(`WARN: ${e}`) }
            try { execSync('npm install --save @cthru/cmdr', { cwd: folder }) } catch (e) { console.log(`WARN: ${e.message}`) }
            execFile(path.resolve(__dirname, '../node_modules/@cthru/cmdr/bin/scaffold.js'), ['create:single', command], { cwd: folder })
        } catch (e) {
            console.log('Could not create script.. : ', e.message)
            process.exit(-1)
        }
        process.exit(0)
    }

    // console.log({options})
    if (!options.command) {
        let [...paths] = getPath(cmd)

        let commands = Array.prototype.concat.apply([], paths.map(p => [...getCommands(p)]))
        if (commands.length <= 0) {
            console.log('No upstream commands found')
            process.exit()
        }

        inq.prompt([
            {
                type: 'autocomplete',
                name: 'command',
                message: 'Which command do you want to execute',
                suggest (input, choices) {
                    return choices.filter(choice => {
                        // console.log({choice, input})
                        return choice.value.split('/').pop().indexOf(input) >= 0
                    })
                },
                choices: commands
            }
        ]).then(a => {
            console.log(`executing ${a.command}`)
            fork(a.command, process.argv.slice(3), { cwd, stdio: 'inherit' })
        }).catch(e => {
            console.log('Cancelled.')
            process.exit(-1)
        })
    } else {
        let [...paths] = getPath(cmd, options.command)

        // console.log({ cwd, paths, cmd })
        if (paths.length > 0) {
            let script = paths[0]
            let args = process.argv.slice(3)
            console.log(`Executing ${script} ${args.join(' ')}`)
            fork(script, args, { cwd, stdio: 'inherit' })
        }
    }

    function* getCommands (folder) {
        let files = []
        try {
            files = fs.readdirSync(folder)
        } catch (e) {}

        while (files.length) {
            let file = path.resolve(folder, files.pop())
            try {
                let st = fs.statSync(file)
                if (st.isFile() && (st.mode & fs.constants.S_IXUSR)) {
                    yield file
                }
            } catch (e) {}
        }
    }

    function* getPath (commandsFolder, command) {
        let paths = process.cwd().split('/')

        while (paths.length > 0) {
            let currentPath = paths.join('/')
            if (currentPath !== '') {
                currentPath = path.resolve(currentPath, `${commandsFolder}/${command || ''}`)
                try {
                    fs.accessSync(currentPath, fs.constants.R_OK)
                    yield currentPath
                } catch (err) {}
            }
            paths.pop()
        }
    }
}

const app = new App(
    {
        name: 'dev',
        command: 'dev',
        description: '',
        callback
    },
    new Param({ name: 'command', defaultValue: null, description: 'The script to execute' }),
    new Argument({ name: 'create-script', description: 'Create a new command in the current folder\'s command folder', defaultValue: null }),
    new Flag(
        {
            name: 'init-script-folder',
            description: 'Create the appropriate script folder',
            intercept () {
                try {
                    let folder = path.resolve(cwd, cmd)
                    fs.mkdirSync(folder)
                    try { execSync('npm init -y', { cwd: folder, shell: true }) } catch (e) { console.log(`WARN: ${e}`) }
                } catch (e) {
                    console.log(e.message)
                }
                console.log(`\nScript folder : ./${cmd}\n`)
                process.exit()
            }
        }
    )
)

app.run()
