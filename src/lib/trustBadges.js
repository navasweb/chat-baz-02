// trustBadges.js
// Exporta únicamente un array estático de datos. Cero lógica, cero estado.
// TrustSidebar.svelte itera este array y no importa nada de chat.svelte.js.

export const trustBadges = [
  {
    icon: "EyeOff",
    label: "Zero Data Retention",
    description: "Tus conversaciones no se almacenan",
  },
  {
    icon: "Server",
    label: "Servidor privado",
    description: "Infraestructura propia, sin terceros",
  },
  {
    icon: "Lock",
    label: "Sin entrenamiento",
    description: "Tus datos nunca entrenan modelos",
  },
];
