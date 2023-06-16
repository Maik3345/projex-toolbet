# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add the output in the release command to show the app name and the version of the app
- Add flag `--no-check-release`, this flag allow to make the release without check if the app is in the release state
- No make the push or commit when the flag `--no-push` is present in the release command

## [1.3.4] - 2023-05-19

- Rename the folder of debug for save the logs of the toolbet

### Fixed

## [1.3.3] - 2023-05-19

### Fixed

- Add `no-deploy` flag to the `release` command, this flag allow to make the release without deploy the new version of the toolbet
- Add `no-push` flag to the `release` command, this flag allow to make the release without push the new version
- Add `-y` or `--yes` flag to the `deploy` command, this flag allow to make the deploy without ask for confirmation

## [1.3.0] - 2023-05-18

### Added

- Create the `release` command for make the release of the new version of the toolbet

## [1.2.1] - 2023-05-15

### Added

- Fix the execution of the `execute` command

## [1.2.0] - 2023-05-15

### Added

- Fix the execution of the `execute` command

## [1.1.0] - 2023-05-15

### Added

- Add the new implementation for make the automatic approval when execute any command of vtex, this allow the execution off all commands in the CI-CD process

## [1.0.2] - 2023-01-03

### Fixed

- Fix the command `puntoscolombia vtex cms backup` the spinner not close when the process finish

## [1.0.1] - 2023-01-03

### Changed

- Update changelog file, update the documentation of the available commands

## [1.0.0] - 2023-01-03

### Added

- Migrate the cli core to `oclif`, this library allow the easy creation of new commands

## [0.6.3] - 2022-12-07

### Fixed

- Fix problems with the directory of the modules
- Update the login vtex command implementation, now use the native endpoint of vtex `http://api.vtexcommercestable.com.br/api/vtexid/apptoken/login?an=${account}` and receive the apikey and apitoken to make the request, this endpoint return the token.

## [0.6.2] - 2022-04-28

### Fixed

- Fix problems with the directory of the modules

## [0.6.1] - 2022-04-28

### Changed

- Update the directory of the folder in the toolbet

## [0.6.0] - 2022-04-28

### Added

- Create the command `vtex publish` this command allow the execution of the original `vtex publish` and `vtex deploy` and control when this executions have one error for exit with `process.exit(1)` and finish the script execution

## [0.5.1] - 2022-03-14

### Fixed

- Change the command of vtex `vtex local:token` for `vtex local token`

## [0.5.0] - 2022-03-11

### Changed

- Change the command of vtex `vtex local token` for `vtex local:token`

## [0.4.1] - 2022-02-18

### Added

- Implement the command `vtex login` for make the login and save the token information for vtex cli

## [0.3.1] - 2021-10-21

### Changed

- Update implementation of alls commands when try to get the account with `vtex local account` no use `vtex whoami` for get the account id

## [0.2.0] - 2020-08-28

### Added

- Update implementation of the command `cmsUpload` for receive the `extension` argument

## [0.1.0] - 2020-06-10

### Added

- Create command for upload the local files to vtex checkout files
