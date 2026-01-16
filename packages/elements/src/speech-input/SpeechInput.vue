<script setup lang="ts">
import type { AudioFormat, CommitStrategy } from '@elevenlabs/client'
import type { HTMLAttributes } from 'vue'
import type { ButtonSize, SpeechInputData } from './context'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { provide, reactive, ref, watch } from 'vue'
import { buildData, SpeechInputContextKey } from './context'
import { useScribe } from './useScribe'

const props = withDefaults(defineProps<{
  /**
   * Function that returns a token for authenticating with the speech service.
   * This should be an async function that fetches a token from your backend.
   */
  getToken: () => Promise<string>
  /**
   * Additional CSS classes for the root container
   */
  class?: HTMLAttributes['class']
  /**
   * Size variant for the component buttons
   * @default "default"
   */
  size?: ButtonSize
  /**
   * Model ID for the speech recognition service
   * @default "scribe_v2_realtime"
   */
  modelId?: string

  /**
   * Base URI for the speech recognition service
   */
  baseUri?: string
  /**
   * Strategy for committing transcripts
   */
  commitStrategy?: CommitStrategy
  /**
   * Silence threshold in seconds for VAD
   */
  vadSilenceThresholdSecs?: number
  /**
   * VAD threshold value
   */
  vadThreshold?: number
  /**
   * Minimum speech duration in milliseconds
   */
  minSpeechDurationMs?: number
  /**
   * Minimum silence duration in milliseconds
   */
  minSilenceDurationMs?: number
  /**
   * Language code for transcription (e.g., "en", "es", "fr")
   */
  languageCode?: string
  /**
   * Microphone configuration options
   */
  microphone?: {
    deviceId?: string
    echoCancellation?: boolean
    noiseSuppression?: boolean
    autoGainControl?: boolean
    channelCount?: number
  }
  /**
   * Audio format for manual audio mode
   */
  audioFormat?: AudioFormat
  /**
   * Sample rate for manual audio mode
   */
  sampleRate?: number
}>(), {
  size: 'default',
  modelId: 'scribe_v2_realtime',
  microphone: () => ({
    echoCancellation: true,
    noiseSuppression: true,
  }),
})

const emit = defineEmits<{
  /**
   * Called whenever the transcript changes (partial or committed)
   */
  change: [data: SpeechInputData]
  /**
   * Called when recording is cancelled
   */
  cancel: [data: SpeechInputData]
  /**
   * Called when recording starts
   */
  start: [data: SpeechInputData]
  /**
   * Called when recording stops
   */
  stop: [data: SpeechInputData]
  /**
   * Called when an error occurs
   */
  error: [error: Error | Event]
  /**
   * Called when an authentication error occurs
   */
  authError: [data: { error: string }]
  /**
   * Called when a quota exceeded error occurs
   */
  quotaExceededError: [data: { error: string }]
}>()

const startRequestId = ref(0)
const transcripts = reactive({
  partialTranscript: '',
  committedTranscripts: [] as string[],
})

const scribe = useScribe({
  modelId: props.modelId,
  baseUri: props.baseUri,
  commitStrategy: props.commitStrategy,
  vadSilenceThresholdSecs: props.vadSilenceThresholdSecs,
  vadThreshold: props.vadThreshold,
  minSpeechDurationMs: props.minSpeechDurationMs,
  minSilenceDurationMs: props.minSilenceDurationMs,
  languageCode: props.languageCode,
  microphone: props.microphone,
  audioFormat: props.audioFormat,
  sampleRate: props.sampleRate,
  onPartialTranscript: (data) => {
    transcripts.partialTranscript = data.text
    emit('change', buildData(transcripts))
  },
  onCommittedTranscript: (data) => {
    transcripts.committedTranscripts.push(data.text)
    transcripts.partialTranscript = ''
    emit('change', buildData(transcripts))
  },
  onError: error => emit('error', error),
  onAuthError: data => emit('authError', data),
  onQuotaExceededError: data => emit('quotaExceededError', data),
})

const isConnecting = ref(false)

// Sync connection status to local ref if needed, or just derive it
watch(() => scribe.status.value, (newStatus) => {
  isConnecting.value = newStatus === 'connecting'
})

async function start() {
  const requestId = startRequestId.value + 1
  startRequestId.value = requestId

  transcripts.partialTranscript = ''
  transcripts.committedTranscripts = []
  scribe.clearTranscripts()

  try {
    const token = await props.getToken()
    if (startRequestId.value !== requestId) {
      return
    }

    await scribe.connect({
      token,
    })

    if (startRequestId.value !== requestId) {
      scribe.disconnect()
      return
    }

    emit('start', buildData(transcripts))
  }
  catch (error) {
    emit('error', error instanceof Error ? error : new Error(String(error)))
  }
}

function stop() {
  startRequestId.value += 1
  scribe.disconnect()
  emit('stop', buildData(transcripts))
}

function cancel() {
  startRequestId.value += 1
  const data = buildData(transcripts)
  scribe.disconnect()
  scribe.clearTranscripts()
  transcripts.partialTranscript = ''
  transcripts.committedTranscripts = []
  emit('cancel', data)
}

// Provide context (use getters so consumers read plain values, but remain reactive)
const contextValue = reactive({
  get isConnected() {
    return scribe.isConnected.value
  },
  get isConnecting() {
    return isConnecting.value
  },
  get transcript() {
    return buildData({
      partialTranscript: scribe.partialTranscript.value,
      committedTranscripts: scribe.committedTranscripts.value.map(t => t.text),
    }).transcript
  },
  get partialTranscript() {
    return scribe.partialTranscript.value
  },
  get committedTranscripts() {
    return scribe.committedTranscripts.value.map(t => t.text)
  },
  get error() {
    return scribe.error.value
  },
  start,
  stop,
  cancel,
  get size() {
    return props.size
  },
})

provide(SpeechInputContextKey, contextValue)
</script>

<template>
  <div
    :class="cn(
      'relative inline-flex items-center overflow-hidden rounded-md transition-all duration-200',
      scribe.isConnected.value
        ? 'bg-background dark:bg-muted shadow-[inset_0_0_0_1px_var(--color-input),0_1px_2px_0_rgba(0,0,0,0.05)]'
        : '',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
