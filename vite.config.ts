import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages repository deployment: set VITE_BASE_PATH=/REPOSITORY_NAME/
// Root/custom-domain deployments can leave this unset.
const base = process.env.VITE_BASE_PATH || '/';
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'Campus Cash — Student Budget', short_name: 'Campus Cash',
      description: 'Your student budget bestie',
      start_url: base, scope: base, display: 'standalone',
      background_color: '#fbf3ee', theme_color: '#fbf3ee',
      icons: [{src: `${base}icon.svg`, sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
    }
  })]
});
