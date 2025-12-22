<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { CheckIcon, XIcon } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'
import { LiveWaveform } from '../live-waveform'

export type VoiceButtonState
  = | 'idle'
    | 'recording'
    | 'processing'
    | 'success'
    | 'error'

interface Props {
  state?: VoiceButtonState
  label?: any
  trailing?: any
  icon?: any
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  waveformClassName?: string
  feedbackDuration?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  state: 'idle',
  variant: 'outline',
  size: 'default',
  feedbackDuration: 1500,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'press'): void
}>()

const showFeedback = ref(false)
let feedbackTimeout: ReturnType<typeof setTimeout> | null = null

function clearFeedbackTimeout() {
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout)
    feedbackTimeout = null
  }
}

watch(() => props.state, (newState) => {
  if (newState === 'success' || newState === 'error') {
    showFeedback.value = true
    clearFeedbackTimeout()
    feedbackTimeout = setTimeout(() => {
      showFeedback.value = false
    }, props.feedbackDuration)
  }
  else {
    // Reset feedback when state changes away from success/error
    showFeedback.value = false
    clearFeedbackTimeout()
  }
})

onUnmounted(clearFeedbackTimeout)

function handleClick(e: MouseEvent) {
  emit('click', e)
  emit('press')
}

const isRecording = computed(() => props.state === 'recording')
const isProcessing = computed(() => props.state === 'processing')
const isSuccess = computed(() => props.state === 'success')
const isError = computed(() => props.state === 'error')

const isDisabled = computed(() => props.disabled || isProcessing.value)
const shouldShowWaveform = computed(() => isRecording.value || isProcessing.value || showFeedback.value)
const shouldShowTrailing = computed(() => !shouldShowWaveform.value && !!props.trailing)
</script>

<template>
  <Button
    type="button"
    :variant="variant"
    :size="size"
    :disabled="isDisabled"
    :class="cn(
      'gap-2 transition-all duration-200',
      size === 'icon' && 'relative',
      className,
    )"
    aria-label="Voice Button"
    @click="handleClick"
  >
    <span
      v-if="size !== 'icon' && (label || $slots.label)"
      class="inline-flex shrink-0 items-center justify-start"
    >
      <slot name="label">{{ label }}</slot>
    </span>

    <div
      :class="cn(
        'relative box-content flex shrink-0 items-center justify-center overflow-hidden transition-all duration-300',
        size === 'icon'
          ? 'absolute inset-0 rounded-sm border-0'
          : 'h-5 w-24 rounded-sm border',
        isRecording
          ? 'bg-primary/10 dark:bg-primary/5'
          : size === 'icon'
            ? 'bg-muted/50 border-0'
            : 'border-border bg-muted/50',
        waveformClassName,
      )"
    >
      <transition
        enter-active-class="animate-in fade-in duration-300"
        leave-active-class="animate-out fade-out duration-300"
      >
        <LiveWaveform
          v-if="shouldShowWaveform"
          :active="isRecording"
          :processing="isProcessing || isSuccess"
          :bar-width="2"
          :bar-gap="1"
          :bar-radius="4"
          :fade-edges="false"
          :sensitivity="1.8"
          :smoothing-time-constant="0.85"
          :height="20"
          mode="static"
          class="absolute inset-0 h-full w-full"
        />
      </transition>

      <transition
        enter-active-class="animate-in fade-in duration-300"
        leave-active-class="animate-out fade-out duration-300"
      >
        <div v-if="shouldShowTrailing" class="absolute inset-0 flex items-center justify-center">
          <slot name="trailing">
            <span v-if="typeof trailing === 'string'" class="text-muted-foreground px-1.5 font-mono text-[10px] font-medium select-none">
              {{ trailing }}
            </span>
            <component :is="trailing" v-else />
          </slot>
        </div>
      </transition>

      <transition
        enter-active-class="animate-in fade-in duration-300"
        leave-active-class="animate-out fade-out duration-300"
      >
        <div
          v-if="!shouldShowWaveform && !shouldShowTrailing && (icon || $slots.icon) && size === 'icon'"
          class="absolute inset-0 flex items-center justify-center"
        >
          <slot name="icon">
            <component :is="icon" />
          </slot>
        </div>
      </transition>

      <transition
        enter-active-class="animate-in fade-in duration-300"
        leave-active-class="animate-out fade-out duration-300"
      >
        <div v-if="isSuccess && showFeedback" class="bg-background/80 absolute inset-0 flex items-center justify-center">
          <span class="text-primary text-[10px] font-medium">
            <CheckIcon class="size-3.5" />
          </span>
        </div>
      </transition>

      <transition
        enter-active-class="animate-in fade-in duration-300"
        leave-active-class="animate-out fade-out duration-300"
      >
        <div v-if="isError && showFeedback" class="bg-background/80 absolute inset-0 flex items-center justify-center">
          <span class="text-destructive text-[10px] font-medium">
            <XIcon class="size-3.5" />
          </span>
        </div>
      </transition>
    </div>
  </Button>
</template>
