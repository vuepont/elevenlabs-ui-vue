<script setup lang="ts">
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@repo/elements/conversation'
import { Message, MessageContent } from '@repo/elements/message'
import { Orb } from '@repo/elements/orb'
import { Response } from '@repo/elements/response'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { onMounted, onUnmounted, ref } from 'vue'

const allMessages = [
  {
    id: '1',
    role: 'user' as const,
    parts: [
      {
        type: 'text',
        text: 'Hey, I need help with my order',
      },
    ],
  },
  {
    id: '2',
    role: 'assistant' as const,
    parts: [
      {
        type: 'text',
        tokens: [
          'Hi!',
          ' I\'d',
          ' be',
          ' happy',
          ' to',
          ' help',
          ' you',
          ' with',
          ' your',
          ' order.',
          ' Could',
          ' you',
          ' please',
          ' provide',
          ' your',
          ' order',
          ' number?',
        ],
        text: 'Hi! I\'d be happy to help you with your order. Could you please provide your order number?',
      },
    ],
  },
  {
    id: '3',
    role: 'user' as const,
    parts: [
      {
        type: 'text',
        text: 'It\'s ORDER-12345',
      },
    ],
  },
  {
    id: '4',
    role: 'assistant' as const,
    parts: [
      {
        type: 'text',
        tokens: [
          'Thank',
          ' you!',
          ' Let',
          ' me',
          ' pull',
          ' up',
          ' your',
          ' order',
          ' details.',
          ' I',
          ' can',
          ' see',
          ' that',
          ' your',
          ' order',
          ' was',
          ' placed',
          ' on',
          ' March',
          ' 15th',
          ' and',
          ' is',
          ' currently',
          ' being',
          ' processed.',
          ' It',
          ' should',
          ' ship',
          ' within',
          ' the',
          ' next',
          ' 1-2',
          ' business',
          ' days.',
          ' Is',
          ' there',
          ' anything',
          ' specific',
          ' you\'d',
          ' like',
          ' to',
          ' know',
          ' about',
          ' this',
          ' order?',
        ],
        text: 'Thank you! Let me pull up your order details. I can see that your order was placed on March 15th and is currently being processed. It should ship within the next 1-2 business days. Is there anything specific you\'d like to know about this order?',
      },
    ],
  },
  {
    id: '5',
    role: 'user' as const,
    parts: [
      {
        type: 'text',
        text: 'Can I change the shipping address?',
      },
    ],
  },
  {
    id: '6',
    role: 'assistant' as const,
    parts: [
      {
        type: 'text',
        tokens: [
          'Absolutely!',
          ' Since',
          ' the',
          ' order',
          ' hasn\'t',
          ' shipped',
          ' yet,',
          ' I',
          ' can',
          ' update',
          ' the',
          ' shipping',
          ' address',
          ' for',
          ' you.',
          ' What',
          ' would',
          ' you',
          ' like',
          ' the',
          ' new',
          ' address',
          ' to',
          ' be?',
        ],
        text: 'Absolutely! Since the order hasn\'t shipped yet, I can update the shipping address for you. What would you like the new address to be?',
      },
    ],
  },
]

const messages = ref<typeof allMessages>([])
const streamingMessageIndex = ref<number | null>(null)
const streamingContent = ref('')

const timeouts: ReturnType<typeof setTimeout>[] = []
const intervals: ReturnType<typeof setInterval>[] = []

onMounted(() => {
  let currentMessageIndex = 0

  const addNextMessage = () => {
    if (currentMessageIndex >= allMessages.length)
      return

    const message = allMessages[currentMessageIndex]
    const part = message.parts[0]

    if (message.role === 'assistant' && 'tokens' in part && part.tokens) {
      streamingMessageIndex.value = currentMessageIndex
      streamingContent.value = ''

      let currentContent = ''
      let tokenIndex = 0

      const streamInterval = setInterval(() => {
        if (tokenIndex < part.tokens!.length) {
          currentContent += part.tokens![tokenIndex]
          streamingContent.value = currentContent
          tokenIndex++
        }
        else {
          clearInterval(streamInterval)
          messages.value.push(message)
          streamingMessageIndex.value = null
          streamingContent.value = ''
          currentMessageIndex++

          // Add next message after a delay
          timeouts.push(setTimeout(addNextMessage, 500))
        }
      }, 100)

      intervals.push(streamInterval)
    }
    else {
      messages.value.push(message)
      currentMessageIndex++

      timeouts.push(setTimeout(addNextMessage, 800))
    }
  }

  // Start after 1 second
  timeouts.push(setTimeout(addNextMessage, 1000))
})

onUnmounted(() => {
  timeouts.forEach(timeout => clearTimeout(timeout))
  intervals.forEach(interval => clearInterval(interval))
})
</script>

<template>
  <Card class="relative mx-auto my-0 size-full h-[400px] py-0">
    <div class="flex h-full flex-col">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            v-if="messages.length === 0 && streamingMessageIndex === null"
            title="Start a conversation"
            description="This is a simulated conversation"
          >
            <template #icon>
              <Orb class="size-12" />
            </template>
          </ConversationEmptyState>

          <template v-else>
            <Message
              v-for="message in messages"
              :key="message.id"
              :from="message.role"
            >
              <MessageContent>
                <template v-for="(part, i) in message.parts" :key="`${message.id}-${i}`">
                  <Response
                    v-if="part.type === 'text'"
                    :content="part.text"
                  />
                </template>
              </MessageContent>
              <div
                v-if="message.role === 'assistant'"
                class="ring-border size-8 overflow-hidden rounded-full ring-1"
              >
                <Orb class="h-full w-full" :agent-state="null" />
              </div>
            </Message>

            <Message
              v-if="streamingMessageIndex !== null"
              :key="`streaming-${streamingMessageIndex}`"
              :from="allMessages[streamingMessageIndex].role"
            >
              <MessageContent>
                <Response :content="streamingContent || '\u200B'" />
              </MessageContent>
              <div
                v-if="allMessages[streamingMessageIndex].role === 'assistant'"
                class="ring-border size-8 overflow-hidden rounded-full ring-1"
              >
                <Orb class="h-full w-full" agent-state="talking" />
              </div>
            </Message>
          </template>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  </Card>
</template>
