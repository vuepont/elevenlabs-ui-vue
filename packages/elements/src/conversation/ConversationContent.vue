<script setup lang="ts">
import { cn } from '@repo/shadcn-vue/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('p-4', props.class)">
    <slot />
  </div>
</template>
