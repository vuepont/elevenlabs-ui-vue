<script setup lang="ts">
import { LiveWaveform } from '@repo/elements/live-waveform'
import { MicSelector } from '@repo/elements/mic-selector'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { Separator } from '@repo/shadcn-vue/components/ui/separator'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Disc, Pause, Play, Trash2 } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'

type RecordingState = 'idle' | 'loading' | 'recording' | 'recorded' | 'playing'

const selectedDevice = ref('')
const isMuted = ref(false)
const state = ref<RecordingState>('idle')
const audioBlob = ref<Blob | null>(null)

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let audioElement: HTMLAudioElement | null = null

async function startRecording() {
  try {
    state.value = 'loading'

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: selectedDevice.value ? { deviceId: { exact: selectedDevice.value } } : true,
    })

    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      audioBlob.value = blob
      stream.getTracks().forEach(track => track.stop())
      state.value = 'recorded'
    }

    mediaRecorder.start()
    state.value = 'recording'
  }
  catch (error) {
    console.error('Error starting recording:', error)
    state.value = 'idle'
  }
}

function stopRecording() {
  if (mediaRecorder && state.value === 'recording') {
    mediaRecorder.stop()
  }
}

function playRecording() {
  if (!audioBlob.value)
    return

  const audio = new Audio(URL.createObjectURL(audioBlob.value))
  audioElement = audio

  audio.onended = () => {
    state.value = 'recorded'
  }

  audio.play()
  state.value = 'playing'
}

function pausePlayback() {
  if (audioElement) {
    audioElement.pause()
    state.value = 'recorded'
  }
}

function restart() {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
  audioBlob.value = null
  audioChunks = []
  state.value = 'idle'
}

// Stop recording when muted
watch([isMuted, state], ([muted, currentState]) => {
  if (muted && currentState === 'recording') {
    stopRecording()
  }
})

onUnmounted(() => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (audioElement) {
    audioElement.pause()
  }
})

const showWaveform = computed(() => state.value === 'recording' && !isMuted.value)
const showProcessing = computed(() => state.value === 'loading' || state.value === 'playing')
const showRecorded = computed(() => state.value === 'recorded')
</script>

<template>
  <div class="flex min-h-[200px] w-full items-center justify-center p-4">
    <Card class="m-0 w-full max-w-2xl border p-0 shadow-lg">
      <div class="flex items-center justify-between gap-2 p-2">
        <div class="h-8 w-[120px] md:h-10 md:w-[200px]">
          <div
            :class="cn(
              'flex h-full items-center gap-2 rounded-md py-1',
              'bg-foreground/5 text-foreground/70',
            )"
          >
            <div class="h-full flex-1">
              <div class="relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm">
                <LiveWaveform
                  :key="state"
                  :active="showWaveform"
                  :processing="showProcessing"
                  :device-id="selectedDevice"
                  :bar-width="3"
                  :bar-gap="1"
                  :bar-radius="4"
                  :fade-edges="true"
                  :fade-width="24"
                  :sensitivity="1.8"
                  :smoothing-time-constant="0.85"
                  :height="20"
                  mode="scrolling"
                  :class="cn(
                    'h-full w-full transition-opacity duration-300',
                    state === 'idle' && 'opacity-0',
                  )"
                />

                <div v-if="state === 'idle'" class="absolute inset-0 flex items-center justify-center">
                  <span class="text-foreground/50 text-[10px] font-medium">Start Recording</span>
                </div>

                <div v-if="showRecorded" class="absolute inset-0 flex items-center justify-center">
                  <span class="text-foreground/50 text-[10px] font-medium">Ready to Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center">
          <MicSelector
            v-model="selectedDevice"
            v-model:muted="isMuted"
            :disabled="state === 'recording' || state === 'loading'"
          />

          <Separator orientation="vertical" class="mx-1 -my-2.5" />

          <Button
            v-if="state === 'idle'"
            variant="ghost"
            size="icon"
            :disabled="isMuted"
            aria-label="Start recording"
            @click="startRecording"
          >
            <Disc class="h-5 w-5" />
          </Button>

          <Button
            v-if="state === 'loading' || state === 'recording'"
            variant="ghost"
            size="icon"
            :disabled="state === 'loading'"
            aria-label="Stop recording"
            @click="stopRecording"
          >
            <Pause class="h-5 w-5" />
          </Button>

          <Button
            v-if="showRecorded"
            variant="ghost"
            size="icon"
            aria-label="Play recording"
            @click="playRecording"
          >
            <Play class="h-5 w-5" />
          </Button>

          <Button
            v-if="state === 'playing'"
            variant="ghost"
            size="icon"
            aria-label="Pause playback"
            @click="pausePlayback"
          >
            <Pause class="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" class="mx-1 -my-2.5" />

          <Button
            variant="ghost"
            size="icon"
            :disabled="['idle', 'loading', 'recording'].includes(state)"
            aria-label="Delete recording"
            @click="restart"
          >
            <Trash2 class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>
