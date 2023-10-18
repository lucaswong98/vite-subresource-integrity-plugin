import fs from 'node:fs'
import { join, resolve as resolvePath } from 'node:path'

import type { CheerioAPI } from 'cheerio'
import { load } from 'cheerio'
import spawn from 'cross-spawn'
import { expect, test } from 'vitest'

import { viteLegacyEntryId } from '@/legacy'
import { computeIntegrity } from '@/util'

const createTask = async (name: string) => {
  const cwd = resolvePath(__dirname, `../../examples/${name}`)
  const dist = resolvePath(cwd, 'dist')
  const task = spawn('pnpm', ['build'], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  const stdout: string[] = []
  const stderr: string[] = []
  return await new Promise<{
    cwd: string
    dist: string
    index: string
    $: CheerioAPI
    manifest?: Record<string, string>
  }>((resolve, reject) => {
    task.stdout?.on('data', (data) => {
      stdout.push(data)
    })
    task.stderr?.on('data', (data) => {
      stderr.push(data)
    })
    task.on('exit', (code) => {
      if (code === 0) {
        let manifest: Record<string, string> = {}
        try {
          manifest = JSON.parse(
            fs.readFileSync(resolvePath(dist, 'manifest.json'), 'utf-8')
          )
        } catch (e) {}
        const index = fs.readFileSync(resolvePath(dist, 'index.html'), 'utf-8')
        resolve({
          cwd,
          dist,
          manifest,
          index,
          $: load(index)
        })
      } else {
        reject(
          new Error(
            `task ${name} execute failed with code ${code}: ${stdout.join(
              ''
            )} ${stderr.join('')}`
          )
        )
      }
    })
    task.on('error', reject)
  })
}

test.concurrent('build vue', async () => {
  const { $, manifest, dist } = await createTask('vue')
  expect(manifest).not.toBeUndefined()
  manifest && verifyAssets($, manifest, dist)
})

test.concurrent('build react', async () => {
  const { $, manifest, dist } = await createTask('react')
  expect(manifest).not.toBeUndefined()
  manifest && verifyAssets($, manifest, dist)
})

const verifyAssets = (
  $: CheerioAPI,
  manifest: Record<string, string>,
  dist: string
) => {
  const scripts = $('script')
  const stylesheets = $('link')
  const elements = Array.from(stylesheets).concat(Array.from(scripts))
  elements.forEach((element) => {
    const src =
      element.attribs.src ?? element.attribs.href ?? element.attribs['data-src']
    const fileName = src?.split('/').pop()
    if (!fileName) {
      return
    }
    if (!['.js', '.css'].find((ext) => fileName.endsWith(ext))) {
      return
    }
    const importMaps = JSON.parse(
      $('script[type="systemjs-importmap"]')?.html() ??
        JSON.stringify({
          integrity: {}
        })
    ).integrity
    const isLegacyEntry = element.attribs.id === viteLegacyEntryId
    let integrity = ''
    if (!isLegacyEntry) {
      integrity = element.attribs.integrity
    } else {
      integrity = importMaps[src.substring(1)]
    }
    if (!integrity) {
      throw new Error(`${fileName} not injected integrity`)
    }
    if (!manifest?.[fileName]) {
      throw new Error(`${fileName} not in manifest`)
    }
    if (integrity !== manifest[fileName]) {
      throw new Error(
        `${fileName} integrity not match, injected: ${integrity}, manifest: ${manifest[fileName]}`
      )
    }
    const file = fs.readFileSync(join(dist, src), 'utf-8')
    expect(computeIntegrity(['sha384'], file)).toEqual(integrity)
  })
}
