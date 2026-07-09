import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // Carpeta de salida del build — esta es la que pondrás
      // como "Publish Directory" en Coolify.
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA: cualquier ruta no encontrada sirve el shell de la app
      precompress: false,
      strict: true
    })
  }
};

export default config;
