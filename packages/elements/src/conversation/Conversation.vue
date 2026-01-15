<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { StickToBottom } from 'vue-stick-to-bottom'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
}>(), {})
</script>

<template>
  <StickToBottom
    :class="cn('relative flex-1 overflow-y-auto', props.class)"
    :initial="{ damping: 20, stiffness: 150, mass: 1 }"
    :resize="{ damping: 20, stiffness: 150, mass: 1 }"
    role="log"
  >
    <slot />
  </StickToBottom>
</template>
