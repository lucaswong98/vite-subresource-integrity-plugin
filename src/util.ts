import { createHash } from 'crypto'

import type { Algorithm, NormalizeBundle, VitePluginSriMaps } from './types'

export const computeIntegrity = (
  algorithms: Algorithm[],
  source: string
): string => {
  const result = algorithms
    .map(
      (algorithm) =>
        `${algorithm}-${createHash(algorithm)
          .update(Buffer.from(source, 'utf-8'))
          .digest('base64')}`
    )
    .join(' ')
  return result
}

export const findAssetByFileName = (
  bundle: Record<string, NormalizeBundle>,
  name: string
) => {
  const bundleName = Object.keys(bundle).find((bundleName) =>
    bundleName.includes(name)
  ) as string
  return bundle[bundleName]
}

export const getFileName = (name?: string) => name?.split('/').pop() ?? ''

export const transToSriHashes = (
  vitePluginSriMaps: VitePluginSriMaps,
  field: 'path' | 'fileName' = 'path'
) => {
  return Object.keys(vitePluginSriMaps).reduce<Record<string, any>>(
    (maps, key) => {
      if (field === 'path') {
        maps[vitePluginSriMaps[key].path] = vitePluginSriMaps[key].integrity
      } else {
        maps[key] = vitePluginSriMaps[key].integrity
      }
      return maps
    },
    {}
  )
}
