<script setup lang="ts">
import type { AlertVariants } from '@repo/shadcn-vue/components/ui/alert'
import type { HTMLAttributes } from 'vue'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/shadcn-vue/components/ui/alert'
import { InfoIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{
  icon?: boolean
  title?: string
  class?: HTMLAttributes['class']
  variant?: AlertVariants['variant']
}>()
</script>

<template>
  <Alert
    :class="cn(
      'bg-background text-foreground mt-6 w-auto border md:-mx-1',
      props.class,
    )"
    :variant
  >
    <InfoIcon v-if="icon" />
    <AlertTitle v-if="title">
      {{ title }}
    </AlertTitle>
    <AlertDescription class="text-card-foreground/80">
      <slot />
    </AlertDescription>
  </Alert>
</template>
