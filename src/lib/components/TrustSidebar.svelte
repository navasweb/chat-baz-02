<script>
  import { trustBadges } from "$lib/trustBadges.js";
  import { ShieldCheck, EyeOff, Server, Lock } from "lucide-svelte";

  const icons = { ShieldCheck, EyeOff, Server, Lock };
</script>

<aside
  class="hidden lg:flex flex-col w-[280px] shrink-0 border-r border-border bg-bg px-5 py-6"
>
  <div class="flex flex-col gap-6">
    {#each trustBadges as badge (badge.label)}
      {@const Icon = icons[badge.icon]}
      <div class="flex items-start gap-3">
        <span class="relative flex items-center justify-center mt-0.5 shrink-0">
          <span class="size-1.5 rounded-full bg-accent animate-pulse absolute -left-2 top-1"></span>
          <Icon class="size-4 text-accent" strokeWidth={1.75} />
        </span>
        <div class="flex flex-col gap-0.5">
          <span class="font-sans text-sm font-medium text-primary">{badge.label}</span>
          <span class="font-mono text-xs text-muted">{badge.description}</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-auto pt-6">
    <span class="font-mono text-muted text-xs">Uptime 99.9%</span>
  </div>
</aside>
