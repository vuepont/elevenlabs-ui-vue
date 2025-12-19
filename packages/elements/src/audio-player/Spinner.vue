<script setup lang="ts">
import { cn } from '@repo/shadcn-vue/lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="cn(
      'border-muted border-t-foreground size-3.5 animate-spin rounded-full border-2',
      $props.class,
    )"
    role="status"
    aria-label="Loading"
  >
    <span class="sr-only">Loading...</span>
  </div>
</template>
