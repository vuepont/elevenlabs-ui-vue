<script setup lang="ts">
import { VoiceButton } from '@repo/elements/voice-button'
import { onMounted, onUnmounted, ref } from 'vue'

type VoiceButtonState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

const state = ref<VoiceButtonState>('idle')

function handlePress() {
  if (state.value === 'idle') {
    state.value = 'recording'
  }
  else if (state.value === 'recording') {
    state.value = 'processing'

    // Simulate an API call / transcription
    setTimeout(() => {
      state.value = 'success'

      // Revert to idle after the feedback duration
      setTimeout(() => {
        state.value = 'idle'
      }, 1500)
    }, 1000)
  }
}

function handleKeyDown(e: KeyboardEvent) {
  // ⌥ (Alt) + Space
  if (e.altKey && e.code === 'Space') {
    e.preventDefault()
    handlePress()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="flex min-h-[200px] w-full items-center justify-center p-4">
    <VoiceButton
      label="Voice"
      trailing="⌥Space"
      :state="state"
      class="min-w-[180px]"
      @press="handlePress"
    />
  </div>
</template>
