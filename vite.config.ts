import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig(({ mode }) => ({
  fmt: { semi: false, singleQuote: true },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [
    // Its file watcher keeps Vitest alive after the run, and unit tests do not render styles.
    mode === 'test' ? null : stylex.vite({ useCSSLayers: true }),
    react(),
  ]),
}))
