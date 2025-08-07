# Copilot Instructions for projex-toolbet

## Project Overview
- **Projex CLI** is a Node.js-based command-line tool for managing project workflows, focusing on Git, VTEX, and Bash automation.
- The CLI is built with [oclif](https://oclif.io/) conventions. Commands are modular and grouped by domain: `git`, `vtex`, and `bash`.
- Source code is organized under `src/commands` (entry points) and `src/modules` (logic, utilities, helpers).

## Key Architectural Patterns
- **Command Structure:** Each CLI command is a file in `src/commands/<domain>/<command>.ts`. Flags, args, and examples are defined per oclif standards.
- **Modules:** Shared logic is in `src/modules` and `src/shared`. Utilities for each domain (e.g., `git`, `vtex`) are further split into subfolders for maintainability.
- **Release Automation:** The `projex git release` command automates version bumps, changelog updates, tagging, and pushes. It reads and updates `package.json` and optionally other files listed in `projex.releaseFiles`.
- **Changelog Format:** Follows [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](http://semver.org/spec/v2.0.0.html). See `CHANGELOG.md` for structure.

## Developer Workflows
- **Local Development:**
  - Start with `npm run dev`.
  - Use `sudo npm link` to link the CLI locally.
- **Testing:**
  - Tests are located alongside logic in `src/modules/<domain>/<command>/`. Use `jest` for running tests (`jest.config.js`).
- **Release & Publish:**
  - Use `npm run postrelease` to publish to npm.
  - The release process is automated via CLI commands and changelog conventions.

## Project-Specific Conventions
- **Command Help:** All commands support `--help` for usage and options.
- **Versioning:** Multiple files can be versioned by listing them in `projex.releaseFiles` in `package.json`.
- **Verbose Logging:** Many commands support `--verbose` for debug output.
- **Non-interactive Mode:** Use `--yes` to auto-confirm prompts.
- **Custom Scripts:** Release commands can trigger pre/post scripts from `manifest.json` if present.

## Integration Points
- **Git:** Extensive automation for repo setup, conventional commits, changelog, and releases. See `src/commands/git/` and `src/modules/apps/git/`.
- **VTEX:** Auth, backup, deploy, and run-script commands. See `src/commands/vtex/` and `src/modules/apps/vtex/`.
- **Bash:** Batch command execution across directories. See `src/commands/bash/`.

## Examples
- To add a new command: create a file in `src/commands/<domain>/`, export the command, and follow oclif patterns.
- To extend release automation: update logic in `src/modules/apps/git/release/` and reference `projex.releaseFiles`.

## References
- [README.md](../README.md) for command documentation and workflow details.
- [CHANGELOG.md](../CHANGELOG.md) for changelog conventions.
- `src/commands/` and `src/modules/` for code structure and patterns.

---
**Feedback:** If any section is unclear or missing, please specify which workflows, conventions, or architectural details need further documentation.
