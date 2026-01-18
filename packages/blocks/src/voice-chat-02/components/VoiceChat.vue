<!-- eslint-disable no-console -->
<script setup lang="ts">
import type { Status } from '@elevenlabs/client'
import type { HTMLAttributes } from 'vue'
import { useConversation } from '@repo/elements/conversation-bar'
import { Orb } from '@repo/elements/orb'
import { ShimmeringText } from '@repo/elements/shimmering-text'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from 'lucide-vue-next'
import { AnimatePresence, Motion } from 'motion-v'
import { computed, onUnmounted, ref } from 'vue'

type AgentState
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
  description: 'Tap to start voice chat',
}

const agentState = ref<AgentState | null>('disconnected')
const errorMessage = ref<string | null>(null)
const mediaStreamRef = ref<MediaStream | null>(null)

const {
  startSession,
  endSession,
  getInputVolume: getConversationInputVolume,
  getOutputVolume: getConversationOutputVolume,
} = useConversation({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onMessage: message => console.log('Message:', message),
  onError: (error: unknown) => {
    console.error('Error:', error)
    agentState.value = 'disconnected'
  },
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

async function startConversation() {
  try {
    errorMessage.value = null
    await getMicStream()
    await startSession({
      agentId: DEFAULT_AGENT.agentId,
      connectionType: 'webrtc',
      onStatusChange: ({ status }: { status: Status }) => {
        agentState.value = status as AgentState
      },
    })
  }
  catch (error) {
    console.error('Error starting conversation:', error)
    agentState.value = 'disconnected'
  }
}

async function handleCall() {
  if (agentState.value === 'disconnected' || agentState.value === null) {
    agentState.value = 'connecting'
    await startConversation()
    return
  }

  if (agentState.value === 'connected') {
    await endSession()
    agentState.value = 'disconnected'
    if (mediaStreamRef.value) {
      mediaStreamRef.value.getTracks().forEach(track => track.stop())
      mediaStreamRef.value = null
    }
  }
}

onUnmounted(() => {
  if (mediaStreamRef.value) {
    mediaStreamRef.value.getTracks().forEach(track => track.stop())
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
  <Card
    :class="cn('flex h-[400px] w-full flex-col items-center justify-center overflow-hidden p-6', props.class)"
  >
    <div class="flex flex-col items-center gap-6">
      <div
        class="bg-muted relative h-32 w-32 rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
      >
        <div
          class="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]"
        >
          <Orb
            volume-mode="manual"
            :get-input-volume="getInputVolume"
            :get-output-volume="getOutputVolume"
          />
        </div>
      </div>

      <div class="flex flex-col items-center gap-2">
        <h2 class="text-xl font-semibold">
          {{ DEFAULT_AGENT.name }}
        </h2>
        <AnimatePresence mode="wait">
          <Motion
            v-if="errorMessage"
            key="error"
            :initial="{ opacity: 0, y: -10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 10 }"
            class="text-destructive text-center text-sm"
          >
            {{ errorMessage }}
          </Motion>
          <Motion
            v-else-if="agentState === 'disconnected' || agentState === null"
            key="disconnected"
            :initial="{ opacity: 0, y: -10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 10 }"
            class="text-muted-foreground text-sm"
          >
            {{ DEFAULT_AGENT.description }}
          </Motion>
          <Motion
            v-else
            key="status"
            :initial="{ opacity: 0, y: -10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 10 }"
            class="flex items-center gap-2"
          >
            <div
              :class="cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                agentState === 'connected' && 'bg-green-500',
                isTransitioning && 'bg-primary/60 animate-pulse',
              )"
            />
            <span class="text-sm capitalize">
              <ShimmeringText
                v-if="isTransitioning"
                :text="agentState ?? ''"
              />
              <span v-else class="text-green-600">Connected</span>
            </span>
          </Motion>
        </AnimatePresence>
      </div>

      <Button
        size="icon"
        :disabled="isTransitioning"
        :variant="isCallActive ? 'secondary' : 'default'"
        class="h-12 w-12 rounded-full"
        @click="handleCall"
      >
        <AnimatePresence mode="wait">
          <Motion
            v-if="isTransitioning"
            key="loading"
            :initial="{ opacity: 0, rotate: 0 }"
            :animate="{ opacity: 1, rotate: 360 }"
            :exit="{ opacity: 0 }"
            :transition="{
              rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
            }"
          >
            <Loader2Icon class="h-5 w-5" />
          </Motion>
          <Motion
            v-else-if="isCallActive"
            key="end"
            :initial="{ opacity: 0, scale: 0.5 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.5 }"
          >
            <PhoneOffIcon class="h-5 w-5" />
          </Motion>
          <Motion
            v-else
            key="start"
            :initial="{ opacity: 0, scale: 0.5 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.5 }"
          >
            <PhoneIcon class="h-5 w-5" />
          </Motion>
        </AnimatePresence>
      </Button>
    </div>
  </Card>
</template>
