<script setup lang="ts">
import { Message, MessageContent } from '@repo/elements/message'
import { Orb } from '@repo/elements/orb'
import { Response } from '@repo/elements/response'
import { onMounted, onUnmounted, ref } from 'vue'

const assistantMessageTokens = [
  'To',
  ' create',
  ' a',
  ' new',
  ' agent',
  ' with',
  ' **',
  'ElevenLabs',
  ' Agents',
  '**',
  ',',
  ' head',
  ' to',
  ' this',
  ' link',
  ':',
  ' ',
  '[',
  'https://elevenlabs.io/app/agents',
  '](',
  'https://elevenlabs.io/app/agents',
  ')',
  '.',
  '\n\n',
  '1.',
  ' Sign',
  ' in',
  ' to',
  ' your',
  ' ElevenLabs',
  ' account',
  '.',
  '\n',
  '2.',
  ' Click',
  ' **New',
  ' Agent**',
  ' to',
  ' start',
  '.',
  '\n',
  '3.',
  ' Give',
  ' your',
  ' agent',
  ' a',
  ' name',
  ' and',
  ' description',
  '.',
  '\n',
  '4.',
  ' Configure',
  ' its',
  ' behavior',
  ',',
  ' knowledge',
  ' sources',
  ',',
  ' and',
  ' voice',
  '.',
  '\n',
  '5.',
  ' Save',
  ' it',
  ' —',
  ' and',
  ' your',
  ' agent',
  ' is',
  ' ready',
  ' to',
  ' use',
  '.',
]

const content = ref('\u200B')
const isStreaming = ref(false)

let intervalId: ReturnType<typeof setInterval>
let timeoutId: ReturnType<typeof setTimeout>

onMounted(() => {
  let currentContent = ''
  let index = 0

  // Equivalent to the 500ms delay before "talking" state
  timeoutId = setTimeout(() => {
    isStreaming.value = true
  }, 500)

  // Streaming interval logic
  intervalId = setInterval(() => {
    if (index < assistantMessageTokens.length) {
      currentContent += assistantMessageTokens[index]
      content.value = currentContent
      index++
    }
    else {
      clearInterval(intervalId)
      isStreaming.value = false
    }
  }, 100)
})

onUnmounted(() => {
  if (intervalId)
    clearInterval(intervalId)
  if (timeoutId)
    clearTimeout(timeoutId)
})
</script>

<template>
  <div class="flex h-full max-h-[400px] w-full max-w-2xl flex-col overflow-hidden">
    <div class="flex flex-col gap-4 overflow-y-auto px-4 py-4">
      <div class="shrink-0">
        <Message from="user">
          <MessageContent>
            How do I create an agent?

            <!-- <Response :content="'How do I create an agent?'" /> -->
          </MessageContent>
        </Message>
      </div>

      <div class="message-demo-lists shrink-0">
        <Message from="assistant">
          <MessageContent>
            <Response :content="content" />
          </MessageContent>

          <div class="ring-border size-8 overflow-hidden rounded-full ring-1">
            <Orb
              class="h-full w-full"
              :agent-state="isStreaming ? 'talking' : null"
            />
          </div>
        </Message>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles replace the 'style jsx global' logic */
:deep(.message-demo-lists ol),
:deep(.message-demo-lists ul) {
  padding-left: 1.25rem !important;
}

:deep(.message-demo-lists li) {
  margin-left: 0 !important;
}
</style>
