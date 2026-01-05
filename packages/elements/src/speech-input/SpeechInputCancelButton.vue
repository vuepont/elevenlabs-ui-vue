<script setup lang="ts">
import type { ButtonVariants } from '@repo/shadcn-vue/components/ui/button'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { cva } from 'class-variance-authority'
import { XIcon } from 'lucide-vue-next'
import { useSpeechInput } from './context'

type SpeechInputCancelButtonBaseProps = InstanceType<typeof Button>['$props']

interface Props extends /* @vue-ignore */ Omit<SpeechInputCancelButtonBaseProps, 'variant' | 'size'> {
  class?: SpeechInputCancelButtonBaseProps['class']
  variant?: ButtonVariants['variant']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const speechInput = useSpeechInput()

const buttonVariants = cva('!px-0', {
  variants: {
    size: {
      default: 'h-9 w-9',
      sm: 'h-8 w-8',
      lg: 'h-10 w-10',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

function handleClick(e: MouseEvent) {
  speechInput.cancel()
  emit('click', e)
}
</script>

<template>
  <Button
    type="button"
    :variant="variant || 'ghost'"
    :inert="speechInput.isConnected ? undefined : true"
    :class="cn(
      buttonVariants({ size: speechInput.size }),
      'transition-[opacity,transform,width] duration-200 ease-out',
      speechInput.isConnected
        ? 'scale-[80%] opacity-100'
        : 'pointer-events-none w-0 scale-100 opacity-0',
      props.class,
    )"
    aria-label="Cancel recording"
    @click="handleClick"
  >
    <XIcon class="h-3 w-3" />
  </Button>
</template>
