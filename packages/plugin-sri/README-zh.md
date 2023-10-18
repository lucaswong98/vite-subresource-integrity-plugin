# vite-subresource-integrity-plugin

[![npm](https://img.shields.io/npm/v/vite-subresource-integrity-plugin.svg)](https://www.npmjs.com/package/vite-subresource-integrity-plugin)
[![ci](https://github.com/msidolphin/vite-subresource-integrity-plugin/actions/workflows/test-unit.yml/badge.svg?branch=master)](https://github.com/msidolphin/vite-subresource-integrity-plugin/actions/workflows/test-unit.yml)

[English](./README.md) | 简体中文

[子资源完整性](https://developer.mozilla.org/zh-CN/docs/Web/Security/Subresource_Integrity)（Subresource Integrity，SRI）是允许浏览器检查其获得的资源（例如从 CDN 获得的）是否被篡改的一项安全特性。它通过验证获取文件的哈希值是否和你提供的哈希值一样来判断资源是否被篡改。

## 安装

```sh
npm i vite-subresource-integrity-plugin -D

pnpm add vite-subresource-integrity-plugin -D

yarn add vite-subresource-integrity-plugin -D
```

## 使用

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

## 配置项

| 属性       | 类型                | 默认值            | 描述                                                                                                  |
| ---------- | ------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| algorithm  | `string` `string[]` | `['sha384']`      | 指定用于计算完整性散列值的散列函数名称                                                                |
| manifest   | `boolean` `string`  | `true`            | 如果 manifest 为 true 值，插件将输出一份manifest.json文件，你可以通过 manifest 作为字符串来设置文件名 |
| extensions | `string[]`          | `['.js', '.css']` | 插件需要处理的文件类型                                                                                |
| enabled    | `boolean`           | `true`            | 启用/禁用插件                                                                                         |
