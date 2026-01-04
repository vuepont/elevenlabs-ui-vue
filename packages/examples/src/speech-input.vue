<script setup lang="ts">
import {
  SpeechInput,
  SpeechInputCancelButton,
  SpeechInputPreview,
  SpeechInputRecordButton,
} from '@repo/elements/speech-input'
import { Input } from '@repo/shadcn-vue/components/ui/input'
import { Textarea } from '@repo/shadcn-vue/components/ui/textarea'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

async function getToken() {
  try {
    const response = await fetch('/api/get-scribe-token', {
      method: 'POST',
    })

    // console.log('Response:', response.json())

    if (!response.ok) {
      throw new Error('Failed to get token')
    }

    const data = await response.json()
    console.log('Data:', data)
    if (data.error) {
      throw new Error(data.error)
    }

    return data.token
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

// --- TextareaWithSpeechInputRight ---
const rightValue = ref('')
const rightValueAtStart = ref('')

function onStartRight() {
  rightValueAtStart.value = rightValue.value
}

function onChangeRight({ transcript }: { transcript: string }) {
  rightValue.value = rightValueAtStart.value + transcript
}

function onStopRight({ transcript }: { transcript: string }) {
  rightValue.value = rightValueAtStart.value + transcript
}

function onCancelRight() {
  rightValue.value = rightValueAtStart.value
}

function onError(error: Error | Event) {
  toast.error(String(error))
}

// --- TextareaWithSpeechInputLeft ---
const leftValue = ref('')
const leftValueAtStart = ref('')

function onStartLeft() {
  leftValueAtStart.value = leftValue.value
}

function onChangeLeft({ transcript }: { transcript: string }) {
  leftValue.value = leftValueAtStart.value + transcript
}

function onStopLeft({ transcript }: { transcript: string }) {
  leftValue.value = leftValueAtStart.value + transcript
}

function onCancelLeft() {
  leftValue.value = leftValueAtStart.value
}

// --- InputWithSpeechInput ---
const inputValue = ref('')
const inputValueAtStart = ref('')

function onStartInput() {
  inputValueAtStart.value = inputValue.value
}

function onChangeInput({ transcript }: { transcript: string }) {
  inputValue.value = inputValueAtStart.value + transcript
}

function onStopInput({ transcript }: { transcript: string }) {
  inputValue.value = inputValueAtStart.value + transcript
}

function onCancelInput() {
  inputValue.value = inputValueAtStart.value
}
</script>

<template>
  <div class="absolute inset-0 space-y-4 overflow-auto rounded-2xl p-10">
    <!-- TextareaWithSpeechInputRight -->
    <div class="relative">
      <Textarea
        v-model="rightValue"
        placeholder="Jot down some thoughts..."
        class="min-h-[120px] resize-none rounded-2xl px-3.5 pt-3 pb-14"
      />
      <div class="absolute right-3 bottom-3 flex items-center gap-2">
        <SpeechInput
          size="sm"
          :get-token="getToken"
          @start="onStartRight"
          @change="onChangeRight"
          @stop="onStopRight"
          @cancel="onCancelRight"
          @error="onError"
        >
          <SpeechInputCancelButton />
          <SpeechInputPreview placeholder="Listening..." />
          <SpeechInputRecordButton />
        </SpeechInput>
      </div>
    </div>

    <!-- TextareaWithSpeechInputLeft -->
    <div class="relative">
      <Textarea
        v-model="leftValue"
        placeholder="Jot down some thoughts..."
        class="min-h-[120px] resize-none rounded-2xl px-3.5 pt-3 pb-14"
      />
      <div class="absolute bottom-3 left-3 flex items-center gap-2">
        <SpeechInput
          size="sm"
          :get-token="getToken"
          @start="onStartLeft"
          @change="onChangeLeft"
          @stop="onStopLeft"
          @cancel="onCancelLeft"
          @error="onError"
        >
          <SpeechInputRecordButton />
          <SpeechInputPreview placeholder="Listening..." />
          <SpeechInputCancelButton />
        </SpeechInput>
      </div>
    </div>

    <!-- InputWithSpeechInput -->
    <div class="flex items-center gap-2.5">
      <Input
        v-model="inputValue"
        placeholder="Give this idea a title..."
        class="min-w-0 flex-1 px-3.5 text-base transition-[flex-basis] duration-200 md:text-sm"
      />
      <SpeechInput
        class="shrink-0"
        :get-token="getToken"
        @start="onStartInput"
        @change="onChangeInput"
        @stop="onStopInput"
        @cancel="onCancelInput"
        @error="onError"
      >
        <SpeechInputCancelButton />
        <SpeechInputRecordButton />
      </SpeechInput>
    </div>
  </div>
</template>
