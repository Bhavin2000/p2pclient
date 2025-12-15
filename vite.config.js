import { defineConfig } from 'vite';

export default defineConfig({
  base: './', 

  optimizeDeps: {
    include: ['gun', 'gun/gun', 'gun/sea', 'gun/lib/webrtc']
  },
  modulePreload: {
    polyfill: false
  }
});