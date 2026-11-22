import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),tailwindcss(),VitePWA({registerType:'autoUpdate',includeAssets:[],manifest:{name:'LifeDesk',short_name:'LifeDesk',description:'Your private personal command centre',theme_color:'#f6f7f5',background_color:'#f6f7f5',display:'standalone',start_url:'/',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},workbox:{navigateFallback:'/index.html'}})],server:{host:'0.0.0.0'}});
