import { load } from 'cheerio'
import { expect, test } from 'vitest'

import { injectSystemImportMap } from '@/legacy'

const maps = {
  'assets/index.js':
    'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO'
}

test('should inject system import map', () => {
  const $ = load(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React + TS</title>
      </head>
      <body>
        <div id="root"></div>
        <script id="vite-legacy-entry" src="/src/main.js"></script>
      </body>
    </html>
  `)
  injectSystemImportMap($, maps)
  expect($('script[type="systemjs-importmap"]').length).toBe(1)
  expect($('script[type="systemjs-importmap"]').html()).toMatch(
    JSON.stringify(maps)
  )
})

test('should not inject system import map', () => {
  const $ = load(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React + TS</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="/src/main.js"></script>
      </body>
    </html>
  `)
  injectSystemImportMap($, maps)
  expect($('script[type="systemjs-importmap"]').length).toBe(0)
})
