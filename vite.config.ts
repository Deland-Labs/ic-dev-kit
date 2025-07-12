import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/src/index.ts'),
      formats: ['es'],
      fileName: (format) => {
        return format === 'es' ? 'module.js' : 'main.js';
      }
    },
    rollupOptions: {
      external: [
        '@dfinity/agent',
        '@dfinity/candid',
        '@dfinity/identity',
        '@dfinity/principal',
        'archiver',
        'bignumber.js',
        'commander',
        'crc',
        'fs',
        'os',
        'path',
        'js-sha256',
        'lodash',
        'node-color-log',
        'sha256',
        'shelljs',
        'text-encoding'
      ]
    },
    sourcemap: true,
    outDir: 'dist'
  },
  plugins: [
    dts({
      staticImport: true,
      insertTypesEntry: true
    })
  ],
  define: {
    global: 'globalThis'
  }
});
