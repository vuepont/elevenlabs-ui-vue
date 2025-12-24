<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Tabs } from '@repo/shadcn-vue/components/ui/tabs'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Tabs :class="cn(props.class)">
    <slot />
  </Tabs>
</template>
