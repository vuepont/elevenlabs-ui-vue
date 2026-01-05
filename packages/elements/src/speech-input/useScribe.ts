import type {
  AudioFormat,
  AudioOptions,
  CommitStrategy,
  CommittedTranscriptMessage,
  CommittedTranscriptWithTimestampsMessage,
  MicrophoneOptions,
  PartialTranscriptMessage,
  RealtimeConnection,
  ScribeAuthErrorMessage,
  ScribeChunkSizeExceededErrorMessage,
  ScribeCommitThrottledErrorMessage,
  ScribeErrorMessage,
  ScribeInputErrorMessage,
  ScribeInsufficientAudioActivityErrorMessage,
  ScribeQueueOverflowErrorMessage,
  ScribeQuotaExceededErrorMessage,
  ScribeRateLimitedErrorMessage,
  ScribeResourceExhaustedErrorMessage,
  ScribeSessionTimeLimitExceededErrorMessage,
  ScribeTranscriberErrorMessage,
  ScribeUnacceptedTermsErrorMessage,
} from '@elevenlabs/client'
import { RealtimeEvents, Scribe } from '@elevenlabs/client'
import { computed, onUnmounted, ref, watchEffect } from 'vue'

// ============= Types =============

export type ScribeStatus
  = | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'transcribing'
    | 'error'

export interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  isFinal: boolean
}

export interface ScribeCallbacks {
  onSessionStarted?: () => void
  onPartialTranscript?: (data: { text: string }) => void
  onCommittedTranscript?: (data: { text: string }) => void
  onCommittedTranscriptWithTimestamps?: (data: {
    text: string
    timestamps?: { start: number, end: number }[]
  }) => void
  /** Called for any error (also called when specific error callbacks fire) */
  onError?: (error: Error | Event) => void
  onAuthError?: (data: { error: string }) => void
  onQuotaExceededError?: (data: { error: string }) => void
  onCommitThrottledError?: (data: { error: string }) => void
  onTranscriberError?: (data: { error: string }) => void
  onUnacceptedTermsError?: (data: { error: string }) => void
  onRateLimitedError?: (data: { error: string }) => void
  onInputError?: (data: { error: string }) => void
  onQueueOverflowError?: (data: { error: string }) => void
  onResourceExhaustedError?: (data: { error: string }) => void
  onSessionTimeLimitExceededError?: (data: { error: string }) => void
  onChunkSizeExceededError?: (data: { error: string }) => void
  onInsufficientAudioActivityError?: (data: { error: string }) => void

  onConnect?: () => void
  onDisconnect?: () => void
}

export interface ScribeHookOptions extends ScribeCallbacks {
  // Connection options
  token?: string
  modelId?: string
  baseUri?: string

  // VAD options
  commitStrategy?: CommitStrategy
  vadSilenceThresholdSecs?: number
  vadThreshold?: number
  minSpeechDurationMs?: number
  minSilenceDurationMs?: number
  languageCode?: string

  // Microphone options (for automatic microphone mode)
  microphone?: {
    deviceId?: string
    echoCancellation?: boolean
    noiseSuppression?: boolean
    autoGainControl?: boolean
    channelCount?: number
  }

  // Manual audio options
  audioFormat?: AudioFormat
  sampleRate?: number

  // Auto-connect on mount
  autoConnect?: boolean

  // Include timestamps
  includeTimestamps?: boolean
}

// ============= Composable Implementation =============

export function useScribe(options: ScribeHookOptions = {}) {
  const connectionRef = ref<RealtimeConnection | null>(null)
  const connectionIdCounterRef = ref(0)
  const activeConnectionIdRef = ref<number | null>(null)

  const status = ref<ScribeStatus>('disconnected')
  const partialTranscript = ref<string>('')
  const committedTranscripts = ref<TranscriptSegment[]>([])
  const error = ref<string | null>(null)

  const isConnected = computed(() => status.value === 'connected' || status.value === 'transcribing')
  const isTranscribing = computed(() => status.value === 'transcribing')

  const disconnect = () => {
    const connection = connectionRef.value
    if (!connection) {
      status.value = 'disconnected'
      activeConnectionIdRef.value = null
      return
    }

    activeConnectionIdRef.value = null
    connectionRef.value = null

    try {
      const result = connection.close()
      if (
        typeof result === 'object'
        && result !== null
        && 'catch' in result
        && typeof (result as Promise<unknown>).catch === 'function'
      ) {
        const promise = result as Promise<void>
        promise.catch(() => {
          /* noop */
        })
      }
    }
    catch (err) {
      console.warn('[useScribe] Failed to close connection', err)
    }
    finally {
      status.value = 'disconnected'
      options.onDisconnect?.()
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  const connect = async (runtimeOptions: Partial<ScribeHookOptions> = {}) => {
    if (connectionRef.value) {
      console.warn('Already connected')
      return
    }

    const connectionId = connectionIdCounterRef.value + 1
    connectionIdCounterRef.value = connectionId

    try {
      status.value = 'connecting'
      error.value = null

      // Merge default options with runtime options
      const token = runtimeOptions.token || options.token
      const modelId = runtimeOptions.modelId || options.modelId

      if (!token) {
        throw new Error('Token is required')
      }
      if (!modelId) {
        throw new Error('Model ID is required')
      }

      // Determine mode: microphone or manual
      const microphone = runtimeOptions.microphone || options.microphone
      const audioFormat = runtimeOptions.audioFormat || options.audioFormat
      const sampleRate = runtimeOptions.sampleRate || options.sampleRate

      let connection: RealtimeConnection

      const includeTimestamps
        = runtimeOptions.includeTimestamps
          ?? !!(
            runtimeOptions.onCommittedTranscriptWithTimestamps
            || options.onCommittedTranscriptWithTimestamps
          )

      if (microphone) {
        // Microphone mode
        connection = Scribe.connect({
          token,
          modelId,
          baseUri: runtimeOptions.baseUri || options.baseUri,
          commitStrategy:
            runtimeOptions.commitStrategy || options.commitStrategy,
          vadSilenceThresholdSecs:
            runtimeOptions.vadSilenceThresholdSecs
            || options.vadSilenceThresholdSecs,
          vadThreshold: runtimeOptions.vadThreshold || options.vadThreshold,
          minSpeechDurationMs:
            runtimeOptions.minSpeechDurationMs || options.minSpeechDurationMs,
          minSilenceDurationMs:
            runtimeOptions.minSilenceDurationMs
            || options.minSilenceDurationMs,
          languageCode: runtimeOptions.languageCode || options.languageCode,
          microphone,
          includeTimestamps,
        } as MicrophoneOptions)
      }
      else if (audioFormat && sampleRate) {
        // Manual audio mode
        connection = Scribe.connect({
          token,
          modelId,
          baseUri: runtimeOptions.baseUri || options.baseUri,
          commitStrategy:
            runtimeOptions.commitStrategy || options.commitStrategy,
          vadSilenceThresholdSecs:
            runtimeOptions.vadSilenceThresholdSecs
            || options.vadSilenceThresholdSecs,
          vadThreshold: runtimeOptions.vadThreshold || options.vadThreshold,
          minSpeechDurationMs:
            runtimeOptions.minSpeechDurationMs || options.minSpeechDurationMs,
          minSilenceDurationMs:
            runtimeOptions.minSilenceDurationMs
            || options.minSilenceDurationMs,
          languageCode: runtimeOptions.languageCode || options.languageCode,
          includeTimestamps,
          audioFormat,
          sampleRate,
        } as AudioOptions)
      }
      else {
        throw new Error(
          'Either microphone options or (audioFormat + sampleRate) must be provided',
        )
      }

      connectionRef.value = connection
      activeConnectionIdRef.value = connectionId

      const runIfCurrent = <Args extends unknown[]>(handler: (...args: Args) => void) => (...args: Args) => {
        if (activeConnectionIdRef.value !== connectionId) {
          return
        }
        handler(...args)
      }

      // Set up event listeners
      connection.on(
        RealtimeEvents.SESSION_STARTED,
        runIfCurrent(() => {
          status.value = 'connected'
          options.onSessionStarted?.()
        }),
      )

      connection.on(
        RealtimeEvents.PARTIAL_TRANSCRIPT,
        runIfCurrent((data: unknown) => {
          const message = data as PartialTranscriptMessage
          partialTranscript.value = message.text
          status.value = 'transcribing'
          options.onPartialTranscript?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.COMMITTED_TRANSCRIPT,
        runIfCurrent((data: unknown) => {
          const message = data as CommittedTranscriptMessage
          const segment: TranscriptSegment = {
            id: `${Date.now()}-${Math.random()}`,
            text: message.text,
            timestamp: Date.now(),
            isFinal: true,
          }
          committedTranscripts.value.push(segment)
          partialTranscript.value = ''
          options.onCommittedTranscript?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.COMMITTED_TRANSCRIPT_WITH_TIMESTAMPS,
        runIfCurrent((data: unknown) => {
          const message = data as CommittedTranscriptWithTimestampsMessage
          const segment: TranscriptSegment = {
            id: `${Date.now()}-${Math.random()}`,
            text: message.text,
            timestamp: Date.now(),
            isFinal: true,
          }
          committedTranscripts.value.push(segment)
          partialTranscript.value = ''
          options.onCommittedTranscriptWithTimestamps?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.ERROR,
        runIfCurrent((err: unknown) => {
          const message = err as ScribeErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onError?.(new Error(message.error))
        }),
      )

      connection.on(
        RealtimeEvents.AUTH_ERROR,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeAuthErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onAuthError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.QUOTA_EXCEEDED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeQuotaExceededErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onQuotaExceededError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.COMMIT_THROTTLED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeCommitThrottledErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onCommitThrottledError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.TRANSCRIBER_ERROR,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeTranscriberErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onTranscriberError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.UNACCEPTED_TERMS,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeUnacceptedTermsErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onUnacceptedTermsError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.RATE_LIMITED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeRateLimitedErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onRateLimitedError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.INPUT_ERROR,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeInputErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onInputError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.QUEUE_OVERFLOW,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeQueueOverflowErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onQueueOverflowError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.RESOURCE_EXHAUSTED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeResourceExhaustedErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onResourceExhaustedError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.SESSION_TIME_LIMIT_EXCEEDED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeSessionTimeLimitExceededErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onSessionTimeLimitExceededError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.CHUNK_SIZE_EXCEEDED,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeChunkSizeExceededErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onChunkSizeExceededError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.INSUFFICIENT_AUDIO_ACTIVITY,
        runIfCurrent((data: unknown) => {
          const message = data as ScribeInsufficientAudioActivityErrorMessage
          error.value = message.error
          status.value = 'error'
          options.onInsufficientAudioActivityError?.(message)
        }),
      )

      connection.on(
        RealtimeEvents.OPEN,
        runIfCurrent(() => {
          options.onConnect?.()
        }),
      )

      connection.on(
        RealtimeEvents.CLOSE,
        runIfCurrent(() => {
          activeConnectionIdRef.value = null
          connectionRef.value = null
          status.value = 'disconnected'
          options.onDisconnect?.()
        }),
      )
    }
    catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to connect'
      error.value = errorMessage
      status.value = 'error'
      throw err
    }
  }

  const sendAudio = (
    audioBase64: string,
    sendOptions?: { commit?: boolean, sampleRate?: number, previousText?: string },
  ) => {
    if (!connectionRef.value) {
      throw new Error('Not connected to Scribe')
    }
    connectionRef.value.send({ audioBase64, ...sendOptions })
  }

  const commit = () => {
    if (!connectionRef.value) {
      throw new Error('Not connected to Scribe')
    }
    connectionRef.value.commit()
  }

  const clearTranscripts = () => {
    committedTranscripts.value = []
    partialTranscript.value = ''
  }

  const getConnection = () => {
    return connectionRef.value
  }

  // Auto-connect if enabled
  watchEffect(() => {
    if (options.autoConnect) {
      connect()
    }
  })

  return {
    // State
    status,
    isConnected,
    isTranscribing,
    partialTranscript,
    committedTranscripts,
    error,

    // Methods
    connect,
    disconnect,
    sendAudio,
    commit,
    clearTranscripts,
    getConnection,
  }
}
