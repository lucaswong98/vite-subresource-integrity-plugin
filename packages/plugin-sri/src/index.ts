import fs from 'node:fs'
import { resolve } from 'node:path'

import { load } from 'cheerio'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

import { injectSystemImportMap, legacyId } from './legacy'
import type { NormalizeBundle, PluginOptions, VitePluginSriMaps } from './types'
import {
  computeIntegrity,
  findAssetByFileName,
  getFileName,
  transToSriHashes
} from './util'
import { validateAlgorithms, validateExtensions } from './validate'

const pluginName = 'vite-subresource-integrity-plugin'

const preloadId = '\0vite/preload-helper'
const sriId = '\0vite/sri-helper.js'

const preAppend = 'link.href = dep;\n'

const placeholder = '"__VITE_PLUGIN_SRIHASHES__"'

const vitePluginSriMaps: VitePluginSriMaps = {}

function plugin(config?: PluginOptions): Plugin {
  const {
    enabled = true,
    algorithm = 'sha384',
    manifest = false,
    extensions = ['.js', '.css']
  } = config ?? {}

  validateAlgorithms(algorithm)

  validateExtensions(extensions)

  const algorithms = typeof algorithm === 'string' ? [algorithm] : algorithm

  if (!enabled) {
    return {
      name: pluginName
    }
  }

  const manifestFileName =
    typeof manifest === 'boolean' ? 'manifest.json' : `${manifest}.json`

  return {
    name: pluginName,
    resolveId: (id) => {
      if (id === sriId) {
        return id
      }
    },
    load: (id) => {
      if (id === sriId) {
        return `export function getIntegrity (asset) {
          const fileName = asset.split('/').pop();
          const sriHashes = ${placeholder};
          return sriHashes[fileName] || '';
        }`
      }
    },
    generateBundle(options, assets) {
      let entryName = ''
      Object.keys(assets).forEach((name) => {
        const asset = assets[name] as NormalizeBundle
        const fileName = getFileName(name)
        if (asset.isEntry && ![legacyId].includes(asset.facadeModuleId)) {
          entryName = name
          vitePluginSriMaps[fileName] = {
            integrity: computeIntegrity(
              algorithms,
              asset.code ?? asset.source ?? ''
            ),
            path: name
          }
          return
        }
        if (!extensions.find((extension) => fileName.endsWith(extension))) {
          return
        }
        vitePluginSriMaps[fileName] = {
          integrity: computeIntegrity(
            algorithms,
            asset.code ?? asset.source ?? ''
          ),
          path: name
        }
      })
      const source = new MagicString((assets[entryName] as any).code)
      const placeholderIndex = source.original.indexOf(placeholder)
      if (placeholderIndex !== -1) {
        source.overwrite(
          placeholderIndex,
          placeholderIndex + placeholder.length,
          JSON.stringify(transToSriHashes(vitePluginSriMaps, 'fileName'))
        )
        const entryFile = assets[entryName] as NormalizeBundle
        if (entryFile.type === 'chunk') {
          entryFile.code = source.toString()
        }
      }
    },
    writeBundle(options, bundle) {
      const outputDir = options.dir ?? ''
      const templates = Object.keys(bundle)
        .filter((name) => name.endsWith('.html'))
        .map((name) => bundle[name]) as Array<{
        source: string
        fileName: string
      }>
      templates.forEach((template) => {
        const $ = load(template.source)
        const scripts = $('script')
        const stylesheets = $('link')
        const elements = Array.from(stylesheets).concat(Array.from(scripts))
        let changed = false
        elements.forEach((element) => {
          const src = element.attribs.src ?? element.attribs.href
          const fileName = getFileName(src)
          if (!fileName) {
            return
          }
          if (element.attribs.integrity) {
            return
          }
          if (!extensions.find((extension) => fileName.endsWith(extension))) {
            return
          }
          const asset = findAssetByFileName(
            bundle as Record<string, NormalizeBundle>,
            fileName
          )
          if (!asset?.isEntry && vitePluginSriMaps[fileName]) {
            element.attribs.integrity = vitePluginSriMaps[fileName].integrity
            changed = true
          } else if(asset) {
            vitePluginSriMaps[fileName] = {
              integrity: computeIntegrity(
                algorithms,
                asset.source ?? asset.code ?? ''
              ),
              path: asset.fileName
            }
            element.attribs.integrity = vitePluginSriMaps[fileName].integrity
            changed = true
          }
        })
        injectSystemImportMap($, transToSriHashes(vitePluginSriMaps))
        if (changed) {
          fs.writeFileSync(resolve(outputDir, template.fileName), $.html())
        }
      })
      if (manifest) {
        fs.writeFileSync(
          resolve(outputDir, manifestFileName),
          JSON.stringify(transToSriHashes(vitePluginSriMaps, 'fileName'))
        )
      }
    },
    transform(code, id) {
      if (id === preloadId) {
        const source = new MagicString(code)
        source.prepend(`import { getIntegrity } from "${sriId}";`)
        const startIndex = code.indexOf(preAppend)
        source.prependRight(
          startIndex + preAppend.length,
          'link.integrity = getIntegrity(dep);\n'
        )
        return {
          code: source.toString(),
          map: source.generateMap({ hires: 'boundary' })
        }
      }
    }
  }
}

export default plugin
