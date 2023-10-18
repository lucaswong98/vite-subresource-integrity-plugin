import SRI from 'vite-subresource-integrity-plugin'
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        legacy({
            targets: ['chrome < 60', 'edge < 15'],
            renderLegacyChunks: true,
        }),
        SRI({
            manifest: true,
        })
    ],
});
