# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
