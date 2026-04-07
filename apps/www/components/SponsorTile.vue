<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'

withDefaults(defineProps<{
  alt?: string
  compact?: boolean
  href: string
  logo?: string
  name: string
}>(), {
  alt: undefined,
  compact: false,
  logo: undefined,
})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="group bg-card hover:bg-muted/60 flex h-full w-full items-center justify-center px-5 py-5 transition-colors"
    :class="compact ? 'min-h-[88px]' : 'min-h-[132px]'"
  >
    <img
      v-if="logo"
      :src="logo"
      :alt="alt ?? name"
      class="h-auto w-full transition-transform group-hover:scale-[1.02]"
      :class="compact ? 'max-w-[136px]' : 'max-w-[220px]'"
    >
    <div
      v-else
      class="text-muted-foreground group-hover:text-foreground flex items-center gap-2 text-center font-medium transition-colors"
      :class="compact ? 'text-xs' : 'text-sm'"
    >
      <span>{{ name }}</span>
      <IconArrowUpRight :size="compact ? 14 : 16" />
    </div>
  </a>
</template>
