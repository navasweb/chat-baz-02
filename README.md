# Badajoz GPT

Interfaz de chat en Svelte 5 + Tailwind v4 conectada a un Chatflow de Flowise vía streaming SSE.

## Dependencias

Este proyecto asume un scaffold de SvelteKit ya existente. Instala:

```bash
npm install -D tailwindcss @tailwindcss/vite
npm install lucide-svelte
```

## Integración con Tailwind v4 (Vite)

En `vite.config.js`:

```js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

Importa `src/app.css` (incluido en este paquete) desde tu layout raíz (`src/routes/+layout.svelte`):

```svelte
<script>
  import '../app.css';
  let { children } = $props();
</script>

{@render children()}
```

## Estructura entregada

```
src/
├── app.css                        # Tokens OKLCH (@theme) del contrato de diseño
├── lib/
│   ├── components/
│   │   ├── ChatBubble.svelte      # Burbuja individual (user | assistant)
│   │   ├── ChatInput.svelte       # Input + botón enviar, auto-resize
│   │   ├── ChatWindow.svelte      # Lista de mensajes + autoscroll
│   │   └── TrustSidebar.svelte    # Columna de confianza (estática)
│   ├── chat.svelte.js             # Estado + streaming SSE (única fuente de verdad)
│   └── trustBadges.js             # Array estático de datos del sidebar
└── routes/
    └── +page.svelte                # Orquestador: cabecera + grid de 2 columnas
```

## Configuración de Flowise

En `src/lib/chat.svelte.js`:

```js
const apiHost = "http://flowise-qs0117hpi1w3vunf2ziymdhi.173.212.221.153.sslip.io";
const chatflowId = "1b28bdd2-27ef-41ab-986f-35a4b0927e4e";
```

El endpoint usado es `POST {apiHost}/api/v1/prediction/{chatflowId}` con `streaming: true`
y `overrideConfig.sessionId` generado una vez por carga de página (`crypto.randomUUID()`,
sin persistencia en `localStorage`).

**Nota sobre CORS:** al llamar desde el navegador directamente a esa IP/host, si el
navegador bloquea la petición por CORS necesitarás habilitar el origen de tu web en la
configuración de Flowise (variable `CORS_ORIGINS` o equivalente en tu despliegue de Coolify),
o servir el frontend desde el mismo dominio/proxy que expone Flowise.

## Notas de implementación

- El parser de streaming en `chat.svelte.js` es tolerante: acepta tanto eventos JSON
  (`{"event":"token","data":"..."}`, `{"event":"end"}`) como texto plano por si el
  Chatflow está configurado para emitir tokens sin envolver en JSON.
- Si el stream termina sin token alguno (p. ej. respuesta vacía), se muestra un aviso
  en la propia burbuja en vez de dejarla en blanco indefinidamente.
- Todo error de red/CORS/timeout se captura y sustituye el contenido del mensaje
  assistant en curso por el texto de error fijado en el contrato (§7), pintado con el
  único acento de color permitido para ese estado (rojo).
