import type { CheerioAPI } from 'cheerio'
import { load } from 'cheerio'

export const viteLegacyEntryId = 'vite-legacy-entry'

export const legacyId = '\0vite/legacy-polyfills'

export const injectSystemImportMap = (
  $: CheerioAPI,
  integrityMaps: Record<string, string>
) => {
  const viteLegacyEntry = $(`#${viteLegacyEntryId}`)
  if (viteLegacyEntry) {
    const systemImportMap = load(`
      <script type="systemjs-importmap">${JSON.stringify({
        integrity: integrityMaps
      })}</script>
    `)('script')
    systemImportMap.insertBefore(viteLegacyEntry)
  }
}
