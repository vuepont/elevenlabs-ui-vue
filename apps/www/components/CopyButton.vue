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

import { IconCheck, IconCopy } from '@tabler/icons-vue'

import { useClipboard } from '@vueuse/core'
import { toRefs } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  value?: string
  class?: HTMLAttributes['class']
  variant?: ButtonVariants['variant']
  tooltip?: string
}>(), {
  value: '',
  variant: 'ghost',
  tooltip: 'Copy to Clipboard',
})
const { value } = toRefs(props)

const { copy, copied } = useClipboard({ source: value })
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          data-slot="copy-button"
          size="icon"
          :variant="variant"
          :class="cn(
            'bg-code absolute top-3 right-2 z-10 size-7 hover:opacity-100 focus-visible:opacity-100',
            props.class,
          )"
          v-bind="$attrs"
          @click="copy()"
        >
          <span class="sr-only">Copy</span>
          <IconCheck v-if="copied" /><IconCopy v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {{ copied ? "Copied" : tooltip }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
