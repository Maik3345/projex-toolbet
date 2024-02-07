# Toolbet Projex

A command line to manage the workflow of the projects for vtex and git

## Installation

```bash
npm i projex

npm i -g projex
```

Available commands:

```bash
$ projex

    A command line to manage the workflow

    VERSION
      projex/1.3.1 darwin-x64 node-v18.15.0

    USAGE
      $ projex [COMMAND]

    TOPICS
      git   Utilities for manage the git repository
      vtex  Utilities for manage the vtex process and workflow

    COMMANDS
      execute  Run a command and accept the ask question by default with yes "y"
      help     display help for projex

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
echo "source $(npm root -g)/projex/plugins/bash/projex.bash" >> ~/.bashrc
echo "source $(npm root -g)/projex/plugins/bash/prompt.bash" >> ~/.bashrc
```
