<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { cva } from 'class-variance-authority'

const props = withDefaults(defineProps<Props>(), {
  variant: 'contained',
})

const messageContentVariants = cva(
  'is-user:dark flex flex-col gap-2 overflow-hidden rounded-lg text-sm',
  {
    variants: {
      variant: {
        contained: [
          'max-w-[80%] px-4 py-3',
          'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
          'group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground',
        ],
        flat: [
          'group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground',
          'group-[.is-assistant]:text-foreground',
        ],
      },
    },
    defaultVariants: {
      variant: 'contained',
    },
  },
)

type MessageContentVariants = VariantProps<typeof messageContentVariants>

interface Props {
  variant?: MessageContentVariants['variant']
  class?: HTMLAttributes['class']
}
</script>

<template>
  <div :class="cn(messageContentVariants({ variant: props.variant }), props.class)">
    <slot />
  </div>
</template>
