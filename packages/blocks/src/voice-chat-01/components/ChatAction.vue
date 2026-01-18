<script setup lang="ts">
import type { ButtonVariants } from '@repo/shadcn-vue/components/ui/button'
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/shadcn-vue/components/ui/tooltip'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { reactiveOmit } from '@vueuse/core'

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'sm',
})

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  tooltip?: string
  label?: string
  class?: HTMLAttributes['class']
}

const delegatedProps = reactiveOmit(props, 'tooltip', 'label', 'class')
</script>

<template>
  <TooltipProvider v-if="props.tooltip">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          v-bind="delegatedProps"
          :class="cn('text-muted-foreground hover:text-foreground relative size-9 p-1.5', props.class)"
        >
          <slot />
          <span class="sr-only">{{ props.label || props.tooltip }}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ props.tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <Button
    v-else
    v-bind="delegatedProps"
    :class="cn('text-muted-foreground hover:text-foreground relative size-9 p-1.5', props.class)"
  >
    <slot />
    <span class="sr-only">{{ props.label }}</span>
  </Button>
</template>
