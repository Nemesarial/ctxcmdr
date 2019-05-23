#!/usr/bin/env node
const fs = require('fs')

const cwd = process.cwd()
const path = require('path')
const cmd = path.basename(process.argv[1])
const { fork } = require('child_process')
const inq = require('enquirer')

const { App, Command, Param, Argument, Flag } = require('@cthru/cmdr')

const callback = (options, app) => {
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
    new Param({ name: 'command', defaultValue: null })
)

app.run()
