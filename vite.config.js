import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/src/index.ts'),
      formats: ['es'],
      fileName: (format) => `${format === 'es' ? 'module' : 'main'}.js`
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        'fs',
        'path',
        '@dfinity/agent',
        '@dfinity/candid',
        '@dfinity/identity',
        '@dfinity/identity-secp256k1',
        '@dfinity/principal',
        'archiver',
        'bignumber.js',
        'commander',
        'crc',
        'js-sha256',
        'lodash',
        'node-color-log',
        'sha256',
        'shelljs'
      ]
    },
    target: 'node16',
    ssr: true,
    minify: false
  }
});
