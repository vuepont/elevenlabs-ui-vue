<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  title?: string
  description?: string
  icon?: Component
}>(), {
  title: 'No messages yet',
  description: 'Start a conversation to see messages here',
})
</script>

<template>
  <div
    :class="cn(
      'flex size-full flex-col items-center justify-center gap-3 p-8 text-center',
      props.class,
    )"
  >
    <slot>
      <div v-if="icon || $slots.icon" class="text-muted-foreground">
        <slot name="icon">
          <component :is="icon" />
        </slot>
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-medium">
          <slot name="title">
            {{ title }}
          </slot>
        </h3>
        <p v-if="description || $slots.description" class="text-muted-foreground text-sm">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>
    </slot>
  </div>
</template>
