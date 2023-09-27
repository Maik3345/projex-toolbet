export const README_TEMPLATE_CODE = `# My App

> My app description

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE: END -->

## Configuration

1. Import the My app to your theme's dependencies in the \`manifest.json\` as shown below:

\`\`\`json
"dependencies": {
  "account.app": "0.x"
}
\`\`\`

## Table of Contents

- [Example](docs/Example.md)`;

export const CHANGELOG_TEMPLATE_CODE = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
`;

export const GIT_IGNORE_TEMPLATE_CODE = `node_modules/
.vscode/
.eslintrc
react/node_modules/
react/coverage
react/.scannerwork
react/*-lock.json
react/__tests__/__snapshots__/*
react/__tests__/*/__snapshots__/*`;
