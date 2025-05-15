import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        return format === 'es' ? 'module.js' : 'main.js';
      },
    },
    rollupOptions: {
      external: [
        '@dfinity/agent',
        '@dfinity/candid',
        '@dfinity/identity',
        '@dfinity/principal',
        '@trust/webcrypto',
        'archiver',
        'bignumber.js',
        'commander',
        'crc',
        'js-sha256',
        'lodash',
        'node-color-log',
        'node-fetch',
        'sha256',
        'shelljs',
        'text-encoding'
      ]
    },
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    dts({
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      path: 'path-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      os: 'os-browserify',
      constants: 'constants-browserify',
    }
  }
});
