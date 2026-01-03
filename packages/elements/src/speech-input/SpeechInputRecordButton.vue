<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { Skeleton } from '@repo/shadcn-vue/components/ui/skeleton'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { cva } from 'class-variance-authority'
import { MicIcon, SquareIcon } from 'lucide-vue-next'
import { useSpeechInput } from './context'

const props = defineProps<{
  class?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
}>()

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
  if (speechInput.isConnected) {
    speechInput.stop()
  }
  else {
    speechInput.start()
  }
  emit('click', e)
}
</script>

<template>
  <Button
    type="button"
    :variant="variant || 'ghost'"
    :disabled="disabled ?? speechInput.isConnecting"
    :class="cn(
      buttonVariants({ size: speechInput.size }),
      'relative flex items-center justify-center transition-all',
      speechInput.isConnected && 'scale-[80%]',
      props.class,
    )"
    :aria-label="speechInput.isConnected ? 'Stop recording' : 'Start recording'"
    @click="handleClick"
  >
    <Skeleton
      :class="cn(
        'absolute h-4 w-4 rounded-full transition-all duration-200',
        speechInput.isConnecting
          ? 'bg-primary scale-90'
          : 'scale-[60%] bg-transparent',
      )"
    />
    <SquareIcon
      :class="cn(
        'text-destructive absolute h-4 w-4 fill-current transition-all duration-200',
        !speechInput.isConnecting && speechInput.isConnected
          ? 'scale-100 opacity-100'
          : 'scale-[60%] opacity-0',
      )"
    />
    <MicIcon
      :class="cn(
        'absolute h-4 w-4 transition-all duration-200',
        !speechInput.isConnecting && !speechInput.isConnected
          ? 'scale-100 opacity-100'
          : 'scale-[60%] opacity-0',
      )"
    />
  </Button>
</template>
