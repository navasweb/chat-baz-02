<script>
  import TrustSidebar from "$lib/components/TrustSidebar.svelte";
  import ChatWindow from "$lib/components/ChatWindow.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
</script>

<div class="flex flex-col h-screen w-screen bg-bg overflow-hidden">
  <header class="h-14 flex items-center justify-center border-b border-border shrink-0">
    <h1 class="font-sans text-[30px] font-semibold tracking-tight text-primary">
      Badajoz<span class="text-accent">GPT</span>
    </h1>
  </header>

  <div class="flex flex-1 min-h-0">
    <TrustSidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <ChatWindow />
      <ChatInput />
    </div>
  </div>
</div>
