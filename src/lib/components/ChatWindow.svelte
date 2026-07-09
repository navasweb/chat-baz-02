<script>
  import { chat } from "$lib/chat.svelte.js";
  import ChatBubble from "./ChatBubble.svelte";
  import { MessageCircle } from "lucide-svelte";

  const ERROR_TEXT = "No se pudo conectar con el asistente. Inténtalo de nuevo.";

  /** @type {HTMLDivElement} */
  let container;

  $effect(() => {
    // Lecturas explícitas necesarias para que Svelte 5 registre la dependencia:
    // - .length: se dispara cuando se añade un mensaje nuevo (push)
    // - .content del último mensaje: se dispara en cada token durante el streaming
    // Leer solo "chat.messages" (la referencia al array) NO basta — los arrays $state
    // son reactivos por índice/length, no por identidad de la referencia.
    const msgs = chat.messages;
    const count = msgs.length;
    const lastContent = msgs[count - 1]?.content;
    void count;
    void lastContent;

    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  });
</script>

<div
  bind:this={container}
  class="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-6 md:px-8"
>
  {#if chat.messages.length === 0}
    <div class="h-full flex flex-col items-center justify-center gap-3 text-muted">
      <MessageCircle class="size-8" strokeWidth={1.5} />
      <p class="font-sans text-[15px]">Empieza la conversación</p>
    </div>
  {:else}
    <div class="flex flex-col max-w-3xl mx-auto">
      {#each chat.messages as message, i (i)}
        <div class={i > 0 && chat.messages[i - 1].role === message.role ? "mt-1.5" : "mt-4"}>
          <ChatBubble
            role={message.role}
            content={message.content}
            isError={message.role === "assistant" && message.content === ERROR_TEXT}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
