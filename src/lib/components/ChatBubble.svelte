<script>
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  /**
   * @type {{ role: 'user' | 'assistant', content: string, isError?: boolean }}
   */
  let { role, content, isError = false } = $props();

  const isUser = $derived(role === "user");
  const isAssistant = $derived(role === "assistant");

  let copiedMode = $state(null);

  const renderedMarkdown = $derived.by(() => {
    if (!isAssistant || !content) return "";

    const rawHtml = marked.parse(content, {
      gfm: true,
      breaks: true
    });

    return DOMPurify.sanitize(rawHtml);
  });

  function markdownToPlainText(markdown) {
    return markdown
      // Bloques de código: quita las triple comillas, mantiene el contenido
      .replace(/```[\s\S]*?```/g, (match) =>
        match
          .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
          .replace(/```$/, "")
      )
      // Código inline
      .replace(/`([^`]+)`/g, "$1")
      // Imágenes
      .replace(/!\[[^\]]*]\([^)]*\)/g, "")
      // Enlaces
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      // Títulos Markdown
      .replace(/^#{1,6}\s+/gm, "")
      // Negrita
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      // Cursiva
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Tachado
      .replace(/~~(.*?)~~/g, "$1")
      // Citas
      .replace(/^>\s?/gm, "")
      // Listas desordenadas
      .replace(/^\s*[-*+]\s+/gm, "- ")
      // Listas ordenadas
      .replace(/^\s*\d+\.\s+/gm, "")
      // Saltos excesivos
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async function copyText(text, mode) {
    if (!text) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function" &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }

      copiedMode = mode;

      setTimeout(() => {
        copiedMode = null;
      }, 1400);
    } catch (error) {
      console.error("No se pudo copiar con navigator.clipboard:", error);

      try {
        fallbackCopyText(text);

        copiedMode = mode;

        setTimeout(() => {
          copiedMode = null;
        }, 1400);
      } catch (fallbackError) {
        console.error("No se pudo copiar con fallback:", fallbackError);
      }
    }
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("document.execCommand('copy') falló");
    }
  }

  function copyAsMarkdown() {
    copyText(content, "markdown");
  }

  function copyAsPlainText() {
    copyText(markdownToPlainText(content), "plain");
  }
</script>

<div class="flex w-full {isUser ? 'justify-end' : 'justify-start'}">
  <div
    class="group max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed font-sans rounded-2xl
      {isUser
      ? 'bg-accent/90 text-zinc-950 rounded-br-md'
      : isError
        ? 'bg-red-950/40 border border-red-500/30 text-primary rounded-bl-md'
        : 'bg-surface text-primary rounded-bl-md'}"
  >
    {#if content.length === 0}
      <span class="flex items-center gap-1 py-0.5">
        <span class="size-1.5 rounded-full bg-muted animate-pulse"></span>
        <span class="size-1.5 rounded-full bg-muted animate-pulse [animation-delay:150ms]"></span>
        <span class="size-1.5 rounded-full bg-muted animate-pulse [animation-delay:300ms]"></span>
      </span>
    {:else if isAssistant}
      <div class="markdown-body break-words">
        {@html renderedMarkdown}
      </div>

      <div class="mt-3 flex flex-wrap gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted hover:bg-white/10 transition"
          onclick={copyAsMarkdown}
        >
          {copiedMode === "markdown" ? "Markdown copiado" : "Copiar Markdown"}
        </button>

        <button
          type="button"
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted hover:bg-white/10 transition"
          onclick={copyAsPlainText}
        >
          {copiedMode === "plain" ? "Texto copiado" : "Copiar normal"}
        </button>
      </div>
    {:else}
      <p class="whitespace-pre-wrap break-words">{content}</p>
    {/if}
  </div>
</div>

<style>
  .markdown-body :global(*) {
    overflow-wrap: anywhere;
  }

  .markdown-body :global(p) {
    margin: 0 0 0.75rem;
  }

  .markdown-body :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown-body :global(h1) {
    margin: 1rem 0 0.5rem;
    font-size: 1.45rem;
    line-height: 1.2;
    font-weight: 700;
  }

  .markdown-body :global(h2) {
    margin: 1rem 0 0.5rem;
    font-size: 1.25rem;
    line-height: 1.25;
    font-weight: 700;
  }

  .markdown-body :global(h3) {
    margin: 0.875rem 0 0.4rem;
    font-size: 1.1rem;
    line-height: 1.3;
    font-weight: 700;
  }

  .markdown-body :global(h4),
  .markdown-body :global(h5),
  .markdown-body :global(h6) {
    margin: 0.75rem 0 0.35rem;
    font-weight: 700;
  }

  .markdown-body :global(ul),
  .markdown-body :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.25rem;
  }

  .markdown-body :global(ul) {
    list-style: disc;
  }

  .markdown-body :global(ol) {
    list-style: decimal;
  }

  .markdown-body :global(li) {
    margin: 0.25rem 0;
  }

  .markdown-body :global(a) {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .markdown-body :global(strong) {
    font-weight: 700;
  }

  .markdown-body :global(blockquote) {
    margin: 0.75rem 0;
    padding-left: 0.9rem;
    border-left: 3px solid rgb(255 255 255 / 0.2);
    color: var(--color-muted);
  }

  .markdown-body :global(pre) {
    margin: 0.9rem 0;
    max-width: 100%;
    overflow-x: auto;
    border-radius: 0.75rem;
    background: rgb(0 0 0 / 0.35);
    padding: 0.9rem;
  }

  .markdown-body :global(code) {
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      "Courier New",
      monospace;
    font-size: 0.9em;
  }

  .markdown-body :global(:not(pre) > code) {
    border-radius: 0.4rem;
    background: rgb(0 0 0 / 0.25);
    padding: 0.12rem 0.35rem;
  }

  .markdown-body :global(table) {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    margin: 0.9rem 0;
  }

  .markdown-body :global(th),
  .markdown-body :global(td) {
    border: 1px solid rgb(255 255 255 / 0.12);
    padding: 0.5rem 0.65rem;
    text-align: left;
    vertical-align: top;
  }

  .markdown-body :global(th) {
    background: rgb(255 255 255 / 0.06);
    font-weight: 700;
  }

  .markdown-body :global(hr) {
    margin: 1rem 0;
    border: 0;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }
</style>
