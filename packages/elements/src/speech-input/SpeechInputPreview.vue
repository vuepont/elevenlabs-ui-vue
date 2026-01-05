<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Motion } from 'motion-v'
import { computed } from 'vue'
import { useSpeechInput } from './context'

interface Props {
  placeholder?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Listening...',
})

const speechInput = useSpeechInput()

const displayText = computed(() => speechInput.transcript || props.placeholder)
const showPlaceholder = computed(() => !speechInput.transcript.trim())
</script>

<template>
  <div
    :inert="speechInput.isConnected ? undefined : true"
    :class="cn(
      'relative self-stretch text-sm transition-[opacity,transform,width] duration-200 ease-out',
      showPlaceholder
        ? 'text-muted-foreground italic'
        : 'text-muted-foreground',
      speechInput.isConnected ? 'w-28 opacity-100' : 'w-0 opacity-0',
      props.class,
    )"
    :title="displayText"
    :aria-hidden="!speechInput.isConnected"
  >
    <div class="absolute inset-y-0 -left-1 -right-1 mask-[linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]">
      <Motion
        :key="displayText"
        layout="position"
        as="p"
        class="absolute bottom-0 right-0 top-0 flex h-full min-w-full items-center whitespace-nowrap px-1"
      >
        {{ displayText }}
      </Motion>
    </div>
  </div>
</template>
