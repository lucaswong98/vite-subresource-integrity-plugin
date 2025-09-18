# vite-subresource-integrity-plugin

[![npm](https://img.shields.io/npm/v/vite-subresource-integrity-plugin.svg)](https://www.npmjs.com/package/vite-subresource-integrity-plugin)
[![ci](https://github.com/msidolphin/vite-subresource-integrity-plugin/actions/workflows/test-unit.yml/badge.svg?branch=master)](https://github.com/msidolphin/vite-subresource-integrity-plugin/actions/workflows/test-unit.yml)

English | [简体中文](./README-zh.md)

[Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (SRI) is a security feature that enables browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation.
It works by allowing you to provide a cryptographic hash that a fetched resource must match.

## Install

```sh
npm i vite-subresource-integrity-plugin -D

pnpm add vite-subresource-integrity-plugin -D

yarn add vite-subresource-integrity-plugin -D
```

## Usage

```js
// vite.config.js
import viteSriPlugin from 'vite-subresource-integrity-plugin'

export default {
  plugins: [
    viteSriPlugin({
      algorithm: ['sha256', 'sha384']
    })
  ]
}
```

## Options

| param      | type                | default           | description                                                                                                                            |
| ---------- | ------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| algorithm  | `string` `string[]` | `['sha384']`      | Specifying the name of a hash function to be used for calculating integrity hash values                                                |
| manifest   | `boolean` `string`  | `true`            | If manifest is a true value, the plugin will output a manifest file, and you can pass manifest as a string to set the name of the file |
| extensions | `string[]`          | `['.js', '.css']` | Types of assets the plugin needs to handle                                                                                             |
| enabled    | `boolean`           | `true`            | Enable or disable plugin                                                                                                               |
