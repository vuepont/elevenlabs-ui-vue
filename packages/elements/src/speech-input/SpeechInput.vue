<script setup lang="ts">
import type { AudioFormat, CommitStrategy } from '@elevenlabs/client'
import type { HTMLAttributes } from 'vue'
import type { ButtonSize, SpeechInputData } from './context'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { provide, reactive, ref, toRef, watch } from 'vue'
import { buildData, SpeechInputContextKey } from './context'
import { useScribe } from './useScribe'

const props = withDefaults(defineProps<{
  getToken: () => Promise<string>
  class?: HTMLAttributes['class']
  size?: ButtonSize
  modelId?: string
  baseUri?: string
  commitStrategy?: CommitStrategy
  vadSilenceThresholdSecs?: number
  vadThreshold?: number
  minSpeechDurationMs?: number
  minSilenceDurationMs?: number
  languageCode?: string
  microphone?: {
    deviceId?: string
    echoCancellation?: boolean
    noiseSuppression?: boolean
    autoGainControl?: boolean
    channelCount?: number
  }
  audioFormat?: AudioFormat
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
  change: [data: SpeechInputData]
  cancel: [data: SpeechInputData]
  start: [data: SpeechInputData]
  stop: [data: SpeechInputData]
  error: [error: Error | Event]
  authError: [data: { error: string }]
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

// Provide context
provide(SpeechInputContextKey, {
  isConnected: scribe.isConnected.value,
  isConnecting: isConnecting.value,
  transcript: buildData(transcripts).transcript, // This needs to be reactive
  partialTranscript: scribe.partialTranscript.value,
  committedTranscripts: scribe.committedTranscripts.value.map(t => t.text),
  error: scribe.error.value,
  start,
  stop,
  cancel,
  size: props.size,
})

const contextValue = reactive({
  isConnected: toRef(scribe.isConnected),
  isConnecting,
  transcript: toRef(() => buildData({
    partialTranscript: scribe.partialTranscript.value,
    committedTranscripts: scribe.committedTranscripts.value.map(t => t.text),
  }).transcript),
  partialTranscript: toRef(scribe.partialTranscript),
  committedTranscripts: toRef(() => scribe.committedTranscripts.value.map(t => t.text)),
  error: toRef(scribe.error),
  start,
  stop,
  cancel,
  size: toRef(() => props.size),
})

provide(SpeechInputContextKey, contextValue as any)
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
