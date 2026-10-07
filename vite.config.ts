import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig(({ mode }) => ({
  fmt: { semi: false, singleQuote: true },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [
    // Its file watcher keeps Vitest alive after the run; only the browser test project needs it.
    mode === 'test' ? null : stylex.vite({ useCSSLayers: true }),
    react(),
  ]),
  // StyleX fails to build dev CSS ("Invalid empty selector") if a style using a breakpoint const
  // is collected before the consts file is transformed, which raced in browser tests.
  server: { warmup: { clientFiles: ['src/styles/tokens.stylex.ts'] } },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.types.ts',
        'src/**/*.stylex.ts',
        'src/main.tsx',
        'src/test/**',
      ],
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        extends: true,
        plugins: [stylex.vite({ useCSSLayers: true })],
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
          },
        },
      },
    ],
  },
}))
