<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@repo/elements/conversation'
import { ConversationBar } from '@repo/elements/conversation-bar'
import { Message, MessageContent } from '@repo/elements/message'
import { Orb } from '@repo/elements/orb'
import { Response } from '@repo/elements/response'
import { Card, CardContent } from '@repo/shadcn-vue/components/ui/card'
import { CheckIcon, CopyIcon } from 'lucide-vue-next'
import { onUnmounted, ref } from 'vue'
import ChatAction from './ChatAction.vue'
import ChatActions from './ChatActions.vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const DEFAULT_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? ''

const messages = ref<ChatMessage[]>([])
const copiedIndex = ref<number | null>(null)
const copyTimeout = ref<number | null>(null)

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

function handleConnect() {
  messages.value = []
}

function handleDisconnect() {
  messages.value = []
}

function handleSendMessage(message: string) {
  const userMessage: ChatMessage = {
    role: 'user',
    content: message,
  }
  messages.value = [...messages.value, userMessage]
}

function handleMessage(message: { source: 'user' | 'ai', message: string }) {
  const newMessage: ChatMessage = {
    role: message.source === 'user' ? 'user' : 'assistant',
    content: message.message,
  }
  messages.value = [...messages.value, newMessage]
}

function handleError(error: Error) {
  console.error('Conversation error:', error)
}

onUnmounted(() => {
  if (copyTimeout.value) {
    window.clearTimeout(copyTimeout.value)
  }
})
</script>

<template>
  <div class="relative mx-auto h-[600px] w-full">
    <Card class="flex h-full w-full flex-col gap-0 overflow-hidden" :class="[props.class]">
      <CardContent class="relative flex-1 overflow-hidden p-0">
        <Conversation class="absolute inset-0 pb-[88px]">
          <ConversationContent class="flex min-w-0 flex-col gap-2 p-6 pb-6">
            <ConversationEmptyState v-if="messages.length === 0">
              <template #icon>
                <Orb class="size-12" />
              </template>
              <template #title>
                Start a conversation
              </template>
              <template #description>
                Tap the phone button or type a message
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
                    <Response class="w-auto wrap-anywhere whitespace-pre-wrap">
                      {{ message.content }}
                    </Response>
                  </MessageContent>
                  <div
                    v-if="message.role === 'assistant'"
                    class="ring-border size-6 shrink-0 self-end overflow-hidden rounded-full ring-1"
                  >
                    <Orb class="h-full w-full" />
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
        <div class="absolute right-0 bottom-0 left-0 flex justify-center">
          <ConversationBar
            class="w-full max-w-2xl"
            :agent-id="DEFAULT_AGENT_ID"
            @connect="handleConnect"
            @disconnect="handleDisconnect"
            @send-message="handleSendMessage"
            @message="handleMessage"
            @error="handleError"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
