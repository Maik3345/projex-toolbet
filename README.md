<h1 align="center">
  <br>
    <img align="center" src="img/logo.png" width="200">
  <br>
	<br>
  Projex CLI
  <br>
  <br>
</h1>

![Projex](https://img.shields.io/badge/projex-grey?style=for-the-badge&logo=oclif)
![NPM Version](https://img.shields.io/npm/v/projex)

---

A command line to manage the workflow of the projects with git, vtex and bash commands

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
      projex/1.26.0 darwin-x64 node-v18.20.1

    USAGE
      $ projex [COMMAND]

    TOPICS
      bash  Utilities for manage the bash process and workflow
      git   Utilities for manage the git repository
      vtex  Utilities for manage the vtex process and workflow

    COMMANDS
      help     display help for projex
```

## Local development

Start `npm run dev`

local `sudo npm link` ò `node npm link`

## Post in npm

Publish to npm `npm run postrelease`

### How to create new module

Create the command file in the folder `./src/commands` with the name of the command, for example `./src/commands/git/git.ts`, create the `examples`, `flags` and `args` options in the file and export the command, you can check the [hello-word](https://github.com/oclif/hello-world/tree/main) example app of oclif to see how to create a command or check the existent commands in the folder `./src/commands`

## List of commands

You can see the list of commands with the command `projex --help` and you can see the help of a specific command with the command `projex <command> --help`

| Command                            | Description                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projex git init`                  | Initialize base files for managing documentation and versioning in a Git repository                                                                                                      |
| `projex git setup husky`           | Set up Husky for selected repositories (only for Git users)                                                                                                                              |
| `projex git setup devops template` | Add necessary files and folders for Azure DevOps setup                                                                                                                                   |
| `projex git update changelog`      | Update the changelog file with the latest changes in the current branch or with the provided content. (Only for git users)                                                               |
| `projex git clone`                 | Clone the specified repositories (Only for git users)                                                                                                                                    |
| `projex git release`               | Bumps the app version, commits, and pushes the app to the remote repository (Only for git users).                                                                                        |
| `projex bash run`                  | Run a command in the current directory or select multiple directories                                                                                                                    |
| `projex vtex login`                | Command to log in to VTEX. This command uses the API key and API token to obtain the authentication token and save it in the VTEX config file, allowing the process to use the VTEX CLI. |
| `projex vtex cms backup`           | Download the files from the checkout files of a VTEX site                                                                                                                                |
| `projex vtex cms deploy`           | Deploy local files in the checkout of the current account                                                                                                                                |
| `projex vtex run`                  | Run a command and automatically accept any "Yes/No" questions by default.                                                                                                                |

## Manage the release version of your project

The command `projex git release` allows you to manage the release version of your project, check the usage of the command:

```bash
Bumps the app version, commits, and pushes the app to the remote repository (Only for git users).

USAGE
  $ projex git release [RELEASETYPE] [TAGNAME] [-v] [-h] [-y] [--no-push] [--no-deploy] [--no-check-release]
    [--no-tag] [--get-version]

ARGUMENTS
  RELEASETYPE  (pre|major|minor|patch|prerelease) [default: patch] The type of release. Defaults to "patch".
  TAGNAME      (stable|beta|hkignore) [default: beta] The name of the tag. Defaults to "beta".

FLAGS
  -h, --help              Shows this help message.
  -v, --verbose           Shows debug level logs.
  -y, --yes               Automatically answer yes to all prompts.
      --get-version       Only get the current version without performing any release actions.
      --no-check-release  Do not automatically check if the release is valid and does not have local changes.
      --no-deploy         Do not automatically run the preRelease script from the manifest file.
      --no-push           Do not automatically push all changes to the remote repository.
      --no-tag            Do not automatically tag the release.

DESCRIPTION
  Bumps the app version, commits, and pushes the app to the remote repository (Only for git users).

EXAMPLES
  projex git release

  projex git release patch

  projex git release patch beta

  projex git release minor stable

  projex git release pre

```

To use the command you need to have the `package.json` file in the root of the project and the `version` field in the file, the command will update the version of the project in the `package.json` file and create a tag with the version in the git repository.

When make the update of the version, the command will update the `CHANGELOG.md` file with the new version making a release section with the structure:

```markdown
## [1.25.0] - 2024-04-24
```

The changelog file need to manage the next structure:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

Your changes all need to be under the `## [Unreleased]` section, the command will move the changes to the new release section with the new version.

## Manage the changelog of your project

The command `projex git update changelog` allows you to manage the changelog of your project, check the usage of the command:

```bash
Update the changelog file with the latest changes in the current branch or with the provided content. (Only for git users)

USAGE
  $ projex git update changelog [RELEASETYPE] [CHANGELOGCONTENT] [-v] [-h]

ARGUMENTS
  RELEASETYPE       (Added|Changed|Fixed|Major) [default: Changed] The type of release for the changelog.
  CHANGELOGCONTENT  Pass the list of comments in a string. This content is used to generate the changelog file changes
                    without using git rev-list. Example: 'test-change-01\ntest-change-02'. Use '\\n' to separate the
                    comments without adding space between them.

FLAGS
  -h, --help     Shows this help message.
  -v, --verbose  Shows debug level logs.

DESCRIPTION
  Update the changelog file with the latest changes in the current branch or with the provided content. (Only for git users)

EXAMPLES
  projex git update changelog [releaseType]

  projex git update changelog Major 'test-change-01\ntest-change-02'

```

To use the command you need to have the `CHANGELOG.md` file in the root of the project, the command will update the changelog file with the latest changes in the current branch or with the provided content.

## Setup husky in your project

The command `projex git setup husky` allows you to setup husky in your project, check the usage of the command:

### Create a basic git files

The command `projex git init` allows you to create the basic files for managing documentation and versioning in a Git repository, check the usage of the command:

this command will create the following files:

```bash
  - docs - Folder to store the documentation of the project
  - README.md - File with the description of the project
  - CHANGELOG.md - File with the changelog of the project
  - .gitignore - File with the gitignore rules
```
