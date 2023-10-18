import { fileURLToPath, URL } from 'node:url';
import SRI from 'vite-subresource-integrity-plugin'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// eslint-disable-next-line no-debugger
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        SRI({
            manifest: true
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
