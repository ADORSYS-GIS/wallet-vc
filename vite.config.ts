import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'vm'],
      globals: { Buffer: true },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
      '@adorsys-gis/multiple-did-identities/src': path.resolve(
        __dirname,
        'node_modules/@adorsys-gis/multiple-did-identities/dist/src',
      ),
      didcomm: path.resolve(__dirname, 'node_modules/didcomm/index.js'),
    },
  },
  optimizeDeps: {
    exclude: ['didcomm'],
    include: ['did-resolver-lib'],
  },
  ssr: {
    noExternal: true,
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000,
  },
});
