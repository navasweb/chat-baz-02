<script>
  import { chat } from "$lib/chat.svelte.js";
  import { ArrowUp } from "lucide-svelte";

  let text = $state("");
  /** @type {HTMLTextAreaElement} */
  let textarea;

  const isDisabled = $derived(chat.isLoading || text.trim().length === 0);

  function autoResize() {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // max-h-32
  }

  function handleInput() {
    autoResize();
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function submit() {
    if (isDisabled) return;
    const value = text;
    text = "";
    if (textarea) {
      textarea.style.height = "auto";
    }
    chat.sendMessage(value);
  }
</script>

<div class="border-t border-border bg-bg p-4 shrink-0">
  <div class="max-w-3xl mx-auto flex items-end gap-3">
    <textarea
      bind:this={textarea}
      bind:value={text}
      oninput={handleInput}
      onkeydown={handleKeydown}
      rows="1"
      placeholder="Escribe un mensaje..."
      class="flex-1 resize-none bg-surface border border-border rounded-xl px-4 py-3
        text-[15px] font-sans text-primary placeholder:text-muted
        max-h-32 overflow-y-auto scrollbar-thin
        focus:outline-none focus:ring-1 focus:ring-accent/50"
    ></textarea>

    <button
      type="button"
      onclick={submit}
      disabled={isDisabled}
      class="size-10 shrink-0 rounded-full bg-accent flex items-center justify-center
        transition-opacity {isDisabled ? 'opacity-40 pointer-events-none' : ''}"
      aria-label="Enviar mensaje"
    >
      <ArrowUp class="size-5 text-zinc-950" strokeWidth={2} />
    </button>
  </div>
</div>
