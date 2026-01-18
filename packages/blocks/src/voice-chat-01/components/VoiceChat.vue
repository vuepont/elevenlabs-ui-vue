<script setup lang="ts">
import type { Status } from '@elevenlabs/client'
import type { HTMLAttributes } from 'vue'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@repo/elements/conversation'
import { useConversation } from '@repo/elements/conversation-bar'
import { Message, MessageContent } from '@repo/elements/message'
import { Orb } from '@repo/elements/orb'
import { Response } from '@repo/elements/response'
import { ShimmeringText } from '@repo/elements/shimmering-text'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@repo/shadcn-vue/components/ui/card'
import { Input } from '@repo/shadcn-vue/components/ui/input'
import { cn } from '@repo/shadcn-vue/lib/utils'
import {
  AudioLinesIcon,
  CheckIcon,
  CopyIcon,
  PhoneOffIcon,
  SendIcon,
} from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'
import ChatAction from './ChatAction.vue'
import ChatActions from './ChatActions.vue'

type SystemMessageType = 'initial' | 'connecting' | 'connected' | 'error'
interface ConversationMessage {
  source: 'user' | 'ai'
  message?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  type?: SystemMessageType
}

type AgentConnectionState
  = | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'disconnecting'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const DEFAULT_AGENT = {
  agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '',
  name: 'Customer Support',
  description: 'AI Voice Assistant',
}

const messages = ref<ChatMessage[]>([])
const agentState = ref<AgentConnectionState | null>('disconnected')
const textInput = ref('')
const copiedIndex = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const mediaStreamRef = ref<MediaStream | null>(null)
const isTextOnlyMode = ref(true)
const copyTimeout = ref<number | null>(null)

const {
  startSession,
  endSession,
  sendUserMessage,
  getInputVolume: getConversationInputVolume,
  getOutputVolume: getConversationOutputVolume,
  status,
} = useConversation({
  onConnect: () => {
    if (!isTextOnlyMode.value) {
      messages.value = []
    }
  },
  onDisconnect: () => {
    if (!isTextOnlyMode.value) {
      messages.value = []
    }
  },
  onMessage: (message: ConversationMessage) => {
    if (message.message) {
      const newMessage: ChatMessage = {
        role: message.source === 'user' ? 'user' : 'assistant',
        content: message.message,
      }
      messages.value = [...messages.value, newMessage]
    }
  },
  onError: (error: unknown) => {
    console.error('Error:', error)
    agentState.value = 'disconnected'
  },
  onDebug: (debug: unknown) => {
    console.warn('Debug:', debug)
  },
})

watch(status, (newStatus) => {
  agentState.value = newStatus as AgentConnectionState
})

async function getMicStream() {
  if (mediaStreamRef.value)
    return mediaStreamRef.value

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStreamRef.value = stream
    errorMessage.value = null
    return stream
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      errorMessage.value = 'Please enable microphone permissions in your browser.'
    }
    throw error
  }
}

async function startConversation(textOnly: boolean = true, skipConnectingMessage: boolean = false) {
  try {
    isTextOnlyMode.value = textOnly

    if (!skipConnectingMessage) {
      messages.value = []
    }

    if (!textOnly) {
      await getMicStream()
    }

    await startSession({
      agentId: DEFAULT_AGENT.agentId,
      connectionType: textOnly ? 'websocket' : 'webrtc',
      overrides: {
        conversation: {
          textOnly,
        },
        agent: {
          firstMessage: textOnly ? '' : undefined,
        },
      },
      onStatusChange: ({ status }: { status: Status }) => {
        agentState.value = status as AgentConnectionState
      },
    })
  }
  catch (error) {
    console.error(error)
    agentState.value = 'disconnected'
    messages.value = []
  }
}

async function handleCall() {
  if (agentState.value === 'disconnected' || agentState.value === null) {
    agentState.value = 'connecting'
    try {
      await startConversation(false)
    }
    catch {
      agentState.value = 'disconnected'
    }
  }
  else if (agentState.value === 'connected') {
    await endSession()
    agentState.value = 'disconnected'

    if (mediaStreamRef.value) {
      mediaStreamRef.value.getTracks().forEach(track => track.stop())
      mediaStreamRef.value = null
    }
  }
}

async function handleSendText() {
  if (!textInput.value.trim())
    return

  const messageToSend = textInput.value

  if (agentState.value === 'disconnected' || agentState.value === null) {
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
    }
    textInput.value = ''
    agentState.value = 'connecting'

    try {
      await startConversation(true, true)
      messages.value = [userMessage]
      sendUserMessage(messageToSend)
    }
    catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }
  else if (agentState.value === 'connected') {
    const newMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
    }
    messages.value = [...messages.value, newMessage]
    textInput.value = ''

    sendUserMessage(messageToSend)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendText()
  }
}

function handleCopy(index: number, content: string) {
  navigator.clipboard.writeText(content)
  copiedIndex.value = index
  if (copyTimeout.value) {
    window.clearTimeout(copyTimeout.value)
  }
  copyTimeout.value = window.setTimeout(() => {
    copiedIndex.value = null
  }, 2000)
}

onUnmounted(() => {
  if (mediaStreamRef.value) {
    mediaStreamRef.value.getTracks().forEach(track => track.stop())
  }
  if (copyTimeout.value) {
    window.clearTimeout(copyTimeout.value)
  }
})

const isCallActive = computed(() => agentState.value === 'connected')
const isTransitioning = computed(() => {
  return agentState.value === 'connecting' || agentState.value === 'disconnecting'
})

function getInputVolume() {
  const rawValue = getConversationInputVolume?.() ?? 0
  return Math.min(1.0, rawValue ** 0.5 * 2.5)
}

function getOutputVolume() {
  const rawValue = getConversationOutputVolume?.() ?? 0
  return Math.min(1.0, rawValue ** 0.5 * 2.5)
}
</script>

<template>
  <Card :class="cn('mx-auto flex h-[380px] w-full flex-col gap-0 overflow-hidden', props.class)">
    <CardHeader class="flex shrink-0 flex-row items-center justify-between pb-4">
      <div class="flex items-center gap-4">
        <div class="ring-border relative size-10 overflow-hidden rounded-full ring-1">
          <Orb
            class="h-full w-full"
            volume-mode="manual"
            :get-input-volume="getInputVolume"
            :get-output-volume="getOutputVolume"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <p class="text-sm leading-none font-medium">
            {{ DEFAULT_AGENT.name }}
          </p>
          <div class="flex items-center gap-2">
            <p v-if="errorMessage" class="text-destructive text-xs">
              {{ errorMessage }}
            </p>
            <p
              v-else-if="agentState === 'disconnected' || agentState === null"
              class="text-muted-foreground text-xs"
            >
              Tap to start voice chat
            </p>
            <p v-else-if="agentState === 'connected'" class="text-xs text-green-600">
              Connected
            </p>
            <ShimmeringText
              v-else-if="isTransitioning"
              :text="agentState ?? ''"
              class="text-xs capitalize"
            />
          </div>
        </div>
      </div>
      <div
        :class="cn(
          'flex h-2 w-2 rounded-full transition-all duration-300',
          agentState === 'connected'
            && 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
          isTransitioning && 'animate-pulse bg-white/40',
        )"
      />
    </CardHeader>
    <CardContent class="flex-1 overflow-hidden h-[300px] p-0">
      <Conversation class="h-full">
        <ConversationContent class="flex min-w-0 flex-col gap-2 p-6 pb-2">
          <ConversationEmptyState v-if="messages.length === 0">
            <template #icon>
              <Orb class="size-12" />
            </template>
            <template #title>
              <ShimmeringText
                v-if="agentState === 'connecting'"
                text="Starting conversation"
              />
              <ShimmeringText
                v-else-if="agentState === 'connected'"
                text="Start talking or type"
              />
              <span v-else>Start a conversation</span>
            </template>
            <template #description>
              <span v-if="agentState === 'connecting'">Connecting...</span>
              <span v-else-if="agentState === 'connected'">Ready to chat</span>
              <span v-else>Type a message or tap the voice button</span>
            </template>
          </ConversationEmptyState>
          <template v-else>
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="flex w-full flex-col gap-1"
            >
              <Message :from="message.role">
                <MessageContent class="max-w-full min-w-0">
                  <Response
                    class="w-auto wrap-anywhere whitespace-pre-wrap"
                  >
                    {{ message.content }}
                  </Response>
                </MessageContent>
                <div
                  v-if="message.role === 'assistant'"
                  class="ring-border size-6 shrink-0 self-end overflow-hidden rounded-full ring-1"
                >
                  <Orb
                    class="h-full w-full"
                    :agent-state="
                      isCallActive && index === messages.length - 1
                        ? 'talking'
                        : null
                    "
                  />
                </div>
              </Message>
              <ChatActions v-if="message.role === 'assistant'">
                <ChatAction
                  size="sm"
                  variant="ghost"
                  :tooltip="copiedIndex === index ? 'Copied!' : 'Copy'"
                  @click="handleCopy(index, message.content)"
                >
                  <CheckIcon v-if="copiedIndex === index" class="size-4" />
                  <CopyIcon v-else class="size-4" />
                </ChatAction>
              </ChatActions>
            </div>
          </template>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </CardContent>
    <CardFooter class="shrink-0 border-t">
      <div class="flex w-full items-center gap-2">
        <div class="flex flex-1 items-center gap-2">
          <Input
            v-model="textInput"
            placeholder="Type a message..."
            class="h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            :disabled="isTransitioning"
            @keydown="handleKeyDown"
          />
          <Button
            size="icon"
            variant="ghost"
            class="rounded-full"
            :disabled="!textInput.trim() || isTransitioning"
            @click="handleSendText"
          >
            <SendIcon class="size-4" />
            <span class="sr-only">Send message</span>
          </Button>
          <Button
            v-if="!isCallActive"
            size="icon"
            variant="ghost"
            class="relative shrink-0 rounded-full transition-all"
            :disabled="isTransitioning"
            @click="handleCall"
          >
            <AudioLinesIcon class="size-4" />
            <span class="sr-only">Start voice call</span>
          </Button>
          <Button
            v-else
            size="icon"
            variant="secondary"
            class="relative shrink-0 rounded-full transition-all"
            :disabled="isTransitioning"
            @click="handleCall"
          >
            <PhoneOffIcon class="size-4" />
            <span class="sr-only">End call</span>
          </Button>
        </div>
      </div>
    </CardFooter>
  </Card>
</template>
