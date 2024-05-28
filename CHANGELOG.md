# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.32.0](https://github.com/Maik3345/projex-toolbet/compare/v1.31.0...v1.32.0) - (2024-05-27)

### Code Refactoring

* improve regex to capture merged pull request id with optional colon and space separator ([8b6602a6](https://github.com/Maik3345/projex-toolbet/commit/8b6602a61f9b21e5ac06e381a39f31900d847f5c))


## [1.31.0](https://github.com/Maik3345/projex-toolbet/compare/v1.30.1...v1.31.0) - (2024-05-27)

### Miscellaneous Chores

* update determinereleasetype logic to consider bug fixes for patch releases ([122d20ae](https://github.com/Maik3345/projex-toolbet/commit/122d20aee73e9b31c2ec60abc715b170524bf4c6))

### Code Refactoring

* improve getpullrequestcommit function logic ([cbbfc7b8](https://github.com/Maik3345/projex-toolbet/commit/cbbfc7b8cd5e054d8dacc6e177330b13fe3cdff0))


## [1.30.1](https://github.com/Maik3345/projex-toolbet/compare/v1.30.0...v1.30.1) - (2024-05-27)

### Bug Fixes

* update regex to capture release version with 'v' prefix ([ae3758a1](https://github.com/Maik3345/projex-toolbet/commit/ae3758a1d0197167c74457778af0ef7fe7747075))


## [1.30.0](https://github.com/Maik3345/projex-toolbet/compare/v1.29.6...v1.30.0) - (2024-05-27)

### Features

* update release process to create changelog content during release ([18a3cdf9](https://github.com/Maik3345/projex-toolbet/commit/18a3cdf9f134833f39970447d3327acc012a5566))


## [1.29.6](https://github.com/Maik3345/projex-toolbet/compare/v1.28.0...v1.29.6) - (2024-05-21)

### Bug Fixes

* update the release process to create the changelog content when make the release ([#9](https://github.com/Maik3345/projex-toolbet/pull/9)) ([60d1958b](https://github.com/Maik3345/projex-toolbet/commit/60d1958b0b862de680000dfe9aa5ab91033cb9d5))


## [1.28.0](https://github.com/Maik3345/projex-toolbet/compare/v1.27.3...v1.28.0) - (2024-05-08)

### Features

* ✨ update the release command and remove the command `git update changelog` ([#8](https://github.com/Maik3345/projex-toolbet/pull/8)) ([5e315b79](https://github.com/Maik3345/projex-toolbet/commit/5e315b79f205690567544f7c4699c185234e9e26))
* add pull request template to github ([629e3186](https://github.com/Maik3345/projex-toolbet/commit/629e31862d73e61d2985af8ff0fd407b049ff8c0))
* ✨ update the release command and remove the command git update changelog ([9eef4a78](https://github.com/Maik3345/projex-toolbet/commit/9eef4a78ce2ee5648680b99995f387658c38e64c))


## [1.27.3] - 2024-05-02

### Fixed

- fix: :bug: refactor success validation in childProcessRunCommandRun function

## [1.27.2] - 2024-05-02

### Fixed

- fix: :bug: fix error handling in executeCommand function, change the logic to determine the error when make the execution of the command of vtex

## [1.27.1] - 2024-04-29

### Fixed

- fix: 🐛 add the failed execution in the release command, add `process.exit(1)` when fail the process

## [1.27.0] - 2024-04-29

### Changed

- feat: ✨ update the command `projex git update changelog` for add the logic to remove the branch name in the commit message and add the commit link in the commit item added when is execute the command

Example

- fix: ⬆️ update dependencies in package.json ([d025ea03](https://github.com/Maik3345/azure-devops-vtex-extension/commit/d025ea03460e72a9992160d9e23e5405d8557494))

The cli generate the message with the commit link and the commit message without the branch name

## [1.26.0] - 2024-04-24

### Changed

- feat: :sparkles: update .gitignore file to exclude build artifacts and logs
- feat: :sparkles: update the README.md content

## [1.25.0] - 2024-04-24

### Added

- feat: ✨ Update the oclif version to the last version and update the dependencies for the last version without vulnerabilities

## [1.24.1] - 2024-04-18

### Fixed

- fix: 🐛 Fix the command `projex git release` make the tag creation before of create the commit message

## [1.24.0] - 2024-04-16

### Changed

- feat: ✨ Update changelog command to accept comments as a string

## [1.23.0] - 2024-04-16

### Changed

- feat: :sparkles: Refactor release command in git/release.ts, remove changelog logic
- feat: :sparkles: Add new command to update changelog file
- main: feat: :sparkles: Refactor release command in git/release.ts, remove changelog logic

## [1.22.1] - 2024-04-11

### Fixed

main: fix: 🐛 Organized the changelog, link to GitHub

## [1.22.0] - 2024-04-11

### Changed

main: fix: 🐛 Update push command to display in blue color
main: fix: 🐛 Fix debug log server connection issue
main: fix: 🐛 Update PR template with new gif link
main: fix: 🐛 Update ChangelogUtils to use h3 headers for release type

## [1.21.0] - 2024-02-13

## Fixed

- fix the process to write the changelog. fix when pass less information in the commit list, this problem make the changelog file write the wrong content

## [1.20.0] - 2024-02-13

## Changed

- add `changeLogReleaseType` in the `release` command for indicate the content of the release commits list, with this attribute you can pass the list of commits to validate to add in the changelog file

## [1.19.0] - 2024-02-13

## Fixed

- fix the process to write the changelog. fix when pass less information in the commit list, this problem make the changelog file with the wrong format

## [1.18.0] - 2024-02-13

## Fixed

- change the method for get the commit list now use `git rev-list --abbrev-commit HEAD --not master --format=short --pretty=oneline`

## [1.17.0] - 2024-02-13

## Added

- add the logic for write the changelog file with the list of changes make in the project, now the command `projex git release prerelease stable` receive the argument for indicate the type of release to add in the changelog file, example `projex git release prerelease stable Major` the value available are `Major`, `Changed`, `Added` and `Fixed`

## [1.16.0] - 2024-02-09

## Added

- add, exclude `failed to install dependencies through yarn` in the publish validation

## [1.15.0] - 2024-02-09

## Added

- add the exclude errors to make the deploy in vtex

## [1.14.1] - 2024-02-06

## Fixed

- fix the name of the attribute in the output of the command `get-version`

## [1.14.0] - 2024-02-06

## Added

- add the push information in the release output when execute with the flag `get-version`

## [1.12.0] - 2024-02-06

## Added

- add the flag `get-version` in the `release` command for get the current version of the project

## [1.11.0] - 2024-01-25

## Changed

- change to `npm install` the commands to install `husky` and `commitlint` in the project

## [1.10.0] - 2023-11-23

## Added

- ✅ update the script of `postinstall` to `prepare` for install the husky and commitlint in the project
- ✨ add the postrelease script for make the build of the project and publish the new version in the npm registry

## [1.9.0] - 2023-10-21

## Fixed

- Remove unused messages and change the message for update the cli

## [1.8.6] - 2023-10-12

## Fixed

- Add husky to dependencies

## [1.8.3] - 2023-09-27

## Added

- feat: change the name of the project to `projex` --> `project-expert`

## [1.8.0] - 2023-09-05

## Added

- feat: add the command `projex git init` for create the next elements:
  `docs` folder for save all docs files of the project
  `CHANGELOG.md` file for save all changes of the project
  `README.md` file for save all information of the project
  `.gitignore` file for ignore the next files and folders:
- feat: add the command `projex git setup devops template` for create the `.azuredevops/pull_request_template/PULL_REQUEST_TEMPALTE.md` file, this file is used for create the template of the pull request in the azure devops
- feat: add the command `projex git setup husky` for create the `husky` configuration in the project with `commitlint` and the `commit-msg` hook for add the name of the current branch in the commit message
- add the unit test for:
  ````bash
  RUNS  src/modules/apps/vtex/login/util/getAuth/getAuth.test.ts
  RUNS  src/modules/apps/vtex/login/login.test.ts
  RUNS  src/modules/apps/vtex/run/run.test.ts
  ```
  ````

## [1.7.0] - 2023-08-07

## Added

- Add the word `beta` in the release command

## [1.6.0] - 2023-08-07

## Added

- Change the icons and the type message in the release command
- Add `husky` and `commitlint`, this allow the validation of the commit message

## [1.5.0] - 2023-08-02

## Added

- add the support to read the `package.json` file to get the version, first read the `manifest.json` if exist and then read the `package.json` file in the last case

## [1.4.0] - 2023-08-01

## Added

- Create the command `projex git clone 'https://DevOpsPCO@dev.azure.com/DevOpsPCO/Marketplace/_git/' '${repoList}'` and `projex git setup hook '/Users/myuser/code/prepare-commit-msg'`

## [1.3.4] - 2023-05-19

- Rename the folder of debug for save the logs of the toolbet

## Fixed

## [1.3.3] - 2023-05-19

## Fixed

- Add `no-deploy` flag to the `release` command, this flag allow to make the release without deploy the new version of the toolbet
- Add `no-push` flag to the `release` command, this flag allow to make the release without push the new version
- Add `-y` or `--yes` flag to the `deploy` command, this flag allow to make the deploy without ask for confirmation

## [1.3.0] - 2023-05-18

## Added

- Create the `release` command for make the release of the new version of the toolbet

## [1.2.1] - 2023-05-15

## Added

- Fix the execution of the `execute` command

## [1.2.0] - 2023-05-15

## Added

- Fix the execution of the `execute` command

## [1.1.0] - 2023-05-15

## Added

- Add the new implementation for make the automatic approval when execute any command of vtex, this allow the execution off all commands in the CI-CD process

## [1.0.2] - 2023-01-03

## Fixed

- Fix the command `projex vtex cms backup` the spinner not close when the process finish

## [1.0.1] - 2023-01-03

## Changed

- Update changelog file, update the documentation of the available commands

## [1.0.0] - 2023-01-03

## Added

- Migrate the cli core to `oclif`, this library allow the easy creation of new commands

## [0.6.3] - 2022-12-07

## Fixed

- Fix problems with the directory of the modules
- Update the login vtex command implementation, now use the native endpoint of vtex `http://api.vtexcommercestable.com.br/api/vtexid/apptoken/login?an=${account}` and receive the apikey and apitoken to make the request, this endpoint return the token.

## [0.6.2] - 2022-04-28

## Fixed

- Fix problems with the directory of the modules

## [0.6.1] - 2022-04-28

## Changed

- Update the directory of the folder in the toolbet

## [0.6.0] - 2022-04-28

## Added

- Create the command `vtex publish` this command allow the execution of the original `vtex publish` and `vtex deploy` and control when this executions have one error for exit with `process.exit(1)` and finish the script execution

## [0.5.1] - 2022-03-14

## Fixed

- Change the command of vtex `vtex local:token` for `vtex local token`

## [0.5.0] - 2022-03-11

## Changed

- Change the command of vtex `vtex local token` for `vtex local:token`

## [0.4.1] - 2022-02-18

## Added

- Implement the command `vtex login` for make the login and save the token information for vtex cli

## [0.3.1] - 2021-10-21

## Changed

- Update implementation of alls commands when try to get the account with `vtex local account` no use `vtex whoami` for get the account id

## [0.2.0] - 2020-08-28

## Added

- Update implementation of the command `cmsUpload` for receive the `extension` argument

## [0.1.0] - 2020-06-10

## Added

- Create command for upload the local files to vtex checkout files
