<!-- eslint-disable vue/custom-event-name-casing -->
<script setup lang="ts">
import type { ComponentPublicInstance, HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { Separator } from '@repo/shadcn-vue/components/ui/separator'
import { Textarea } from '@repo/shadcn-vue/components/ui/textarea'
import { cn } from '@repo/shadcn-vue/lib/utils'
import {
  ArrowUpIcon,
  ChevronDown,
  Keyboard,
  Mic,
  MicOff,
  PhoneIcon,
  XIcon,
} from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { LiveWaveform } from '../live-waveform'
import { useConversation } from './useConversation' // TODO: move this to the external package

export type AgentConnectionState
  = | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'disconnecting'

interface Props {
  agentId: string
  class?: HTMLAttributes['class']
  waveformClassName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'connect'): void
  (e: 'disconnect'): void
  (e: 'error', error: Error): void
  (e: 'message', payload: { source: 'user' | 'ai', message: string }): void
  (e: 'send-message', message: string): void
}>()

const isMuted = ref(false)
const agentState = ref<AgentConnectionState>('disconnected')
const keyboardOpen = ref(false)
const textInput = ref('')
const textareaRef = ref<ComponentPublicInstance | null>(null)

const {
  status,
  startSession,
  endSession,
  sendUserMessage,
  sendContextualUpdate,
} = useConversation({
  micMuted: isMuted,
  onConnect: () => emit('connect'),
  onDisconnect: () => {
    agentState.value = 'disconnected'
    keyboardOpen.value = false
    emit('disconnect')
  },
  onMessage: msg => emit('message', msg),
  onError: (error: unknown) => {
    console.error('Conversation Error:', error)
    agentState.value = 'disconnected'
    const errorObj = error instanceof Error
      ? error
      : new Error(typeof error === 'string' ? error : JSON.stringify(error))
    emit('error', errorObj)
  },
})

watch(status, (newStatus) => {
  agentState.value = newStatus as AgentConnectionState
})

const isConnected = computed(() => agentState.value === 'connected')
const isConnecting = computed(() => agentState.value === 'connecting')
const isDisconnected = computed(() => agentState.value === 'disconnected')
const isDisconnecting = computed(() => agentState.value === 'disconnecting')

async function startConversation() {
  try {
    agentState.value = 'connecting'
    await startSession({
      agentId: props.agentId,
      onStatusChange: ({ status }) => {
        agentState.value = status as AgentConnectionState
      },
    })
  }
  catch (error) {
    console.error('Error starting conversation:', error)
    agentState.value = 'disconnected'
    emit('error', error as Error)
  }
}

async function handleEndSession() {
  await endSession()
  agentState.value = 'disconnected'
}

function handleStartOrEnd() {
  if (agentState.value === 'connected' || agentState.value === 'connecting') {
    handleEndSession()
  }
  else if (agentState.value === 'disconnected') {
    startConversation()
  }
}

function handleSendText() {
  if (!textInput.value.trim())
    return

  const messageToSend = textInput.value
  sendUserMessage(messageToSend)
  textInput.value = ''
  emit('send-message', messageToSend)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendText()
  }
}

// Send contextual updates when typing (only if connected)
watch(textInput, (newVal) => {
  if (newVal.trim() && agentState.value === 'connected') {
    sendContextualUpdate(newVal)
  }
})

// Toggle keyboard method
function toggleKeyboard() {
  keyboardOpen.value = !keyboardOpen.value
  if (keyboardOpen.value) {
    nextTick(() => {
      const el = textareaRef.value?.$el as HTMLTextAreaElement | undefined
      el?.focus()
    })
  }
}
</script>

<template>
  <div :class="cn('flex w-full items-end justify-center p-4', props.class)">
    <Card class="m-0 w-full gap-0 border p-0 shadow-lg">
      <div class="flex flex-col-reverse">
        <div>
          <Separator v-if="keyboardOpen" />

          <div class="flex items-center justify-between gap-2 p-2">
            <div class="h-8 w-[120px] md:h-10">
              <div :class="cn('flex h-full items-center gap-2 rounded-md py-1', 'bg-foreground/5 text-foreground/70')">
                <div class="h-full flex-1">
                  <div :class="cn('relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm', props.waveformClassName)">
                    <LiveWaveform
                      :key="isDisconnected ? 'idle' : 'active'"
                      :active="isConnected && !isMuted"
                      :processing="isConnecting"
                      :bar-width="3"
                      :bar-gap="1"
                      :bar-radius="4"
                      :fade-edges="true"
                      :fade-width="24"
                      :sensitivity="1.8"
                      :smoothing-time-constant="0.85"
                      :height="20"
                      mode="static"
                      :class="cn('h-full w-full transition-opacity duration-300', isDisconnected && 'opacity-0')"
                    />

                    <div
                      v-if="isDisconnected"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <span class="text-foreground/50 text-[10px] font-medium">
                        Customer Support
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                :aria-pressed="isMuted"
                :class="cn(isMuted ? 'bg-foreground/5' : '')"
                :disabled="!isConnected"
                @click="isMuted = !isMuted"
              >
                <MicOff v-if="isMuted" />
                <Mic v-else />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                :aria-pressed="keyboardOpen"
                class="relative"
                :disabled="!isConnected"
                @click="toggleKeyboard"
              >
                <Keyboard
                  :class="cn(
                    'h-5 w-5 transform-gpu transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    keyboardOpen ? 'scale-75 opacity-0' : 'scale-100 opacity-100',
                  )"
                />
                <ChevronDown
                  :class="cn(
                    'absolute inset-0 m-auto h-5 w-5 transform-gpu transition-all delay-50 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    keyboardOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                  )"
                />
              </Button>

              <Separator orientation="vertical" class="mx-1 -my-2.5" />

              <Button
                variant="ghost"
                size="icon"
                :disabled="isDisconnecting"
                @click="handleStartOrEnd"
              >
                <XIcon v-if="isConnected || isConnecting" class="h-5 w-5" />
                <PhoneIcon v-else class="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          :class="cn(
            'overflow-hidden transition-all duration-300 ease-out',
            keyboardOpen ? 'max-h-[120px]' : 'max-h-0',
          )"
        >
          <div class="relative px-2 pt-2 pb-2">
            <Textarea
              ref="textareaRef"
              v-model="textInput"
              placeholder="Enter your message..."
              class="min-h-[100px] resize-none border-0 pr-12 shadow-none focus-visible:ring-0"
              :disabled="!isConnected"
              @keydown="handleKeyDown"
            />
            <Button
              size="icon"
              variant="ghost"
              :disabled="!textInput.trim() || !isConnected"
              class="absolute right-3 bottom-3 h-8 w-8"
              @click="handleSendText"
            >
              <ArrowUpIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
