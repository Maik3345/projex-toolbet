# Toolbet Puntos Colombia

## Installation

```bash
npm i puntoscolombia

npm i -g puntoscolombia
```

Available commands:

```bash
$ puntoscolombia

    A command line to manage the workflow

    VERSION
      puntoscolombia/1.3.1 darwin-x64 node-v18.15.0

    USAGE
      $ puntoscolombia [COMMAND]

    TOPICS
      git   Utilities for manage the git repository
      vtex  Utilities for manage the vtex process and workflow

    COMMANDS
      execute  Run a command and accept the ask question by default with yes "y"
      help     display help for puntoscolombia

```

## Local development

Start `npm run watch`

local `sudo npm link` ò `node npm link`

## Post in npm

Publish to npm `sudo npm publish`

### How to create new module

1. Create the module for the command in the folder `./modules`

2. Add the command in the tree of commands in the file `./modules/tree.ts` for allow the use of the command.

## How to do so?

#### `bash` users

If you are a bash user you can start customizing your command prompt by running the following command:

```sh
echo "source $(npm root -g)/puntoscolombia/plugins/bash/puntoscolombia.bash" >> ~/.bashrc
echo "source $(npm root -g)/puntoscolombia/plugins/bash/prompt.bash" >> ~/.bashrc
```
