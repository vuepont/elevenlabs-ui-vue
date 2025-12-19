import type { AudioWorkletConfig, Callbacks, ClientToolsConfig, FormatConfig, InputConfig, Mode, Options, OutputConfig, SessionConfig, Status } from '@elevenlabs/client'
import type { Ref } from 'vue'
import { Conversation } from '@elevenlabs/client'
import { onUnmounted, ref, shallowRef, unref, watch } from 'vue'

const PACKAGE_VERSION = '0.12.0'

export interface DeviceFormatConfig {
  format: 'pcm' | 'ulaw'
  sampleRate: number
  outputDeviceId?: string
}

export interface DeviceInputConfig {
  preferHeadphonesForIosDevices?: boolean
  inputDeviceId?: string
}

export type Location = 'us' | 'global' | 'eu-residency' | 'in-residency'

export function parseLocation(location: string = 'us'): Location {
  switch (location) {
    case 'eu-residency':
    case 'in-residency':
    case 'us':
    case 'global':
      return location
    default:
      console.warn(
        `[ConversationalAI] Invalid server-location: ${location}. Defaulting to "us"`,
      )
      return 'us'
  }
}

export function getOriginForLocation(location: Location): string {
  const originMap: Record<Location, string> = {
    'us': 'wss://api.elevenlabs.io',
    'eu-residency': 'wss://api.eu.residency.elevenlabs.io',
    'in-residency': 'wss://api.in.residency.elevenlabs.io',
    'global': 'wss://api.elevenlabs.io',
  }
  return originMap[location]
}

export function getLivekitUrlForLocation(location: Location): string {
  const livekitUrlMap: Record<Location, string> = {
    'us': 'wss://livekit.rtc.elevenlabs.io',
    'eu-residency': 'wss://livekit.rtc.eu.residency.elevenlabs.io',
    'in-residency': 'wss://livekit.rtc.in.residency.elevenlabs.io',
    'global': 'wss://livekit.rtc.elevenlabs.io',
  }
  return livekitUrlMap[location]
}

export type HookCallbacks = Pick<
  Callbacks,
  | 'onConnect'
  | 'onDisconnect'
  | 'onError'
  | 'onMessage'
  | 'onAudio'
  | 'onModeChange'
  | 'onStatusChange'
  | 'onCanSendFeedbackChange'
  | 'onDebug'
  | 'onUnhandledClientToolCall'
  | 'onVadScore'
  | 'onInterruption'
  | 'onAgentToolResponse'
  | 'onAgentToolRequest'
  | 'onConversationMetadata'
  | 'onMCPToolCall'
  | 'onMCPConnectionStatus'
  | 'onAsrInitiationMetadata'
  | 'onAgentChatResponsePart'
>

export type HookOptions = Partial<
  SessionConfig
  & HookCallbacks
  & ClientToolsConfig
  & InputConfig
  & OutputConfig
  & AudioWorkletConfig
  & FormatConfig & {
    serverLocation?: Location | string
  }
>

export interface ControlledState {
  micMuted?: boolean | Ref<boolean>
  volume?: number | Ref<number>
}

export function useConversation<T extends HookOptions & ControlledState>(
  props: T = {} as T,
) {
  // Destructure reactive props if they exist, or use defaults
  const { serverLocation, ...defaultOptions } = props

  // Refs for internal state (shallowRef is sufficient for non-reactive class instances)
  const conversationRef = shallowRef<Conversation | null>(null)
  const lockRef = shallowRef<Promise<Conversation> | null>(null)
  const shouldEndRef = shallowRef(false)

  // Reactive State
  const status = ref<Status>('disconnected')
  const canSendFeedback = ref(false)
  const mode = ref<Mode>('listening')

  // Handle micMuted changes
  watch(
    () => unref(props.micMuted),
    (newVal) => {
      if (newVal !== undefined) {
        conversationRef.value?.setMicMuted(newVal)
      }
    },
    { immediate: true },
  )

  // Handle volume changes
  watch(
    () => unref(props.volume),
    (newVal) => {
      if (newVal !== undefined) {
        conversationRef.value?.setVolume({ volume: newVal })
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    shouldEndRef.value = true
    if (lockRef.value) {
      lockRef.value.then(conv => conv.endSession())
    }
    else {
      conversationRef.value?.endSession()
    }
  })

  // Start Session Logic
  const startSession = async (options?: HookOptions) => {
    if (conversationRef.value?.isOpen()) {
      return conversationRef.value.getId()
    }

    if (lockRef.value) {
      const conversation = await lockRef.value
      return conversation.getId()
    }

    shouldEndRef.value = false

    try {
      const resolvedServerLocation = parseLocation(
        options?.serverLocation || serverLocation,
      )
      const origin = getOriginForLocation(resolvedServerLocation)
      const calculatedLivekitUrl = getLivekitUrlForLocation(
        resolvedServerLocation,
      )

      // Create the start promise
      lockRef.value = Conversation.startSession({
        ...(defaultOptions ?? {}),
        ...(options ?? {}),
        origin,

        livekitUrl:
          options?.livekitUrl
          || defaultOptions?.livekitUrl
          || calculatedLivekitUrl,

        overrides: {
          ...(defaultOptions?.overrides ?? {}),
          ...(options?.overrides ?? {}),
          client: {
            ...(defaultOptions?.overrides?.client ?? {}),
            ...(options?.overrides?.client ?? {}),
            source:
              options?.overrides?.client?.source
              || defaultOptions?.overrides?.client?.source
              || 'react_sdk', // TODO: update this to vue_sdk in the external package
            version:
              options?.overrides?.client?.version
              || defaultOptions?.overrides?.client?.version
              || PACKAGE_VERSION,
          },
        },
        // Callbacks
        onConnect: options?.onConnect || defaultOptions?.onConnect,
        onDisconnect: options?.onDisconnect || defaultOptions?.onDisconnect,
        onError: options?.onError || defaultOptions?.onError,
        onMessage: options?.onMessage || defaultOptions?.onMessage,
        onAudio: options?.onAudio || defaultOptions?.onAudio,
        onDebug: options?.onDebug || defaultOptions?.onDebug,
        onUnhandledClientToolCall:
          options?.onUnhandledClientToolCall
          || defaultOptions?.onUnhandledClientToolCall,
        onVadScore: options?.onVadScore || defaultOptions?.onVadScore,
        onInterruption:
          options?.onInterruption || defaultOptions?.onInterruption,
        onAgentToolRequest:
          options?.onAgentToolRequest || defaultOptions?.onAgentToolRequest,
        onAgentToolResponse:
          options?.onAgentToolResponse || defaultOptions?.onAgentToolResponse,
        onConversationMetadata:
          options?.onConversationMetadata
          || defaultOptions?.onConversationMetadata,
        onMCPToolCall:
          options?.onMCPToolCall || defaultOptions?.onMCPToolCall,
        onMCPConnectionStatus:
          options?.onMCPConnectionStatus
          || defaultOptions?.onMCPConnectionStatus,
        onAsrInitiationMetadata:
          options?.onAsrInitiationMetadata
          || defaultOptions?.onAsrInitiationMetadata,
        onAgentChatResponsePart:
          options?.onAgentChatResponsePart
          || defaultOptions?.onAgentChatResponsePart,

        // Internal State Updates
        onModeChange: ({ mode: newMode }) => {
          mode.value = newMode;
          (options?.onModeChange || defaultOptions?.onModeChange)?.({ mode: newMode })
        },
        onStatusChange: ({ status: newStatus }) => {
          status.value = newStatus;
          (options?.onStatusChange || defaultOptions?.onStatusChange)?.({
            status: newStatus,
          })
        },
        onCanSendFeedbackChange: ({ canSendFeedback: newCanSend }) => {
          canSendFeedback.value = newCanSend;
          (
            options?.onCanSendFeedbackChange
            || defaultOptions?.onCanSendFeedbackChange
          )?.({ canSendFeedback: newCanSend })
        },
      } as Options)

      conversationRef.value = await lockRef.value

      // Check if session was cancelled while connecting
      if (shouldEndRef.value) {
        await conversationRef.value.endSession()
        conversationRef.value = null
        lockRef.value = null
        throw new Error('Session cancelled during connection')
      }

      // Sync Controlled State
      const currentMuted = unref(props.micMuted)
      if (currentMuted !== undefined) {
        conversationRef.value.setMicMuted(currentMuted)
      }

      const currentVolume = unref(props.volume)
      if (currentVolume !== undefined) {
        conversationRef.value.setVolume({ volume: currentVolume })
      }

      return conversationRef.value.getId()
    }
    finally {
      lockRef.value = null
    }
  }

  // End Session Logic
  const endSession = async () => {
    shouldEndRef.value = true
    const pendingConnection = lockRef.value
    const conversation = conversationRef.value
    conversationRef.value = null

    if (pendingConnection) {
      const conv = await pendingConnection
      await conv.endSession()
    }
    else {
      await conversation?.endSession()
    }
  }

  const setVolume = ({ volume }: { volume: number }) => {
    conversationRef.value?.setVolume({ volume })
  }

  const getInputByteFrequencyData = () => {
    return conversationRef.value?.getInputByteFrequencyData()
  }

  const getOutputByteFrequencyData = () => {
    return conversationRef.value?.getOutputByteFrequencyData()
  }

  const getInputVolume = () => {
    return conversationRef.value?.getInputVolume() ?? 0
  }

  const getOutputVolume = () => {
    return conversationRef.value?.getOutputVolume() ?? 0
  }

  const sendFeedback = (like: boolean) => {
    conversationRef.value?.sendFeedback(like)
  }

  const getId = () => {
    return conversationRef.value?.getId()
  }

  const sendContextualUpdate = (text: string) => {
    conversationRef.value?.sendContextualUpdate(text)
  }

  const sendUserMessage = (text: string) => {
    conversationRef.value?.sendUserMessage(text)
  }

  const sendUserActivity = () => {
    conversationRef.value?.sendUserActivity()
  }

  const sendMCPToolApprovalResult = (toolCallId: string, isApproved: boolean) => {
    conversationRef.value?.sendMCPToolApprovalResult(toolCallId, isApproved)
  }

  const changeInputDevice = async (
    config: DeviceFormatConfig & DeviceInputConfig,
  ) => {
    if (
      conversationRef.value
      && 'changeInputDevice' in conversationRef.value
    ) {
      // @ts-expect-error - Dynamic check for optional method
      return await conversationRef.value.changeInputDevice(config)
    }
    throw new Error(
      'Device switching is only available for voice conversations',
    )
  }

  const changeOutputDevice = async (config: DeviceFormatConfig) => {
    if (
      conversationRef.value
      && 'changeOutputDevice' in conversationRef.value
    ) {
      // @ts-expect-error - Dynamic check for optional method
      return await conversationRef.value.changeOutputDevice(config)
    }
    throw new Error(
      'Device switching is only available for voice conversations',
    )
  }

  return {
    startSession,
    endSession,
    setVolume,
    getInputByteFrequencyData,
    getOutputByteFrequencyData,
    getInputVolume,
    getOutputVolume,
    sendFeedback,
    getId,
    sendContextualUpdate,
    sendUserMessage,
    sendUserActivity,
    sendMCPToolApprovalResult,
    changeInputDevice,
    changeOutputDevice,
    status,
    canSendFeedback,
    isSpeaking: ref(mode.value === 'speaking'),
    mode,
  }
}
