# ctxcmdr
I know, I know.. terrible name. This is a utility app I'm sharing with the
people I work with. When I have some more time, I'm going to make it better and
put it in a proper project. 


## Setup
To install `npm install -g @cthru/ctxcmdr`
After installation it will prompt you for a command name / script folder name.
Just stick to the default (`dev`) 

## Usage
For many projects I have a `/dev` folder containing node cli utilities to help
automate the project. Usually, I would just go to the root of the project and do
`dev/log` to run the log watching script. However, if I am in some subfolder.. I
have to first go to my project root to run the utility script or deal relative
paths. Nobody likes to do `../../dev/log`

This utility lives globally under the command you selected (`dev`) by default.
If you run `dev log` it will look for the first /dev folder in the hierarchy
that contains a `log` script and will then execute *that* script

If you run `dev` without arguments, it will find all the `/dev` folders up the
folder tree and list all the executables (`chmod +x`) files. Start typing to
filter and selecting a task will execute it.

Now I can be wherever in my project and do `dev log` without having to hunt for
the script

That is all this does.

Needless to say, if you decide to use a different command - say `d` - then it
will look in `.../d/*` for scripts rather than in `.../dev/*`

Don't look at the code - it is horrible. You have been warned. If do though, and you squint, you may see a quick example implementation of generators as used to find the script folders and script files.

### Create a script folder
`dev --init-script-folder` will create `./dev` and do `npm init -y`

### Create a script
`dev --create-script <scriptname>` will create a new @cthru/cmdr style script
after doing the same as `--init-script-folder` 

