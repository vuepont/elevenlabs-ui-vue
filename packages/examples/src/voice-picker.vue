<script setup lang="ts">
import type { ElevenLabs } from '@elevenlabs/elevenlabs-js'
import { VoicePicker } from '@repo/elements/voice-picker'
import { ref } from 'vue'

const voices: ElevenLabs.Voice[] = [
  {
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'premade',
    labels: {
      accent: 'american',
      descriptive: 'casual',
      age: 'young',
      gender: 'female',
      language: 'en',
      use_case: 'conversational',
    },
    description:
      'Matter-of-fact, personable woman. Great for conversational use cases.',
    previewUrl:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b4928a68-c03b-411f-8533-3d5c299fd451.mp3',
  },
  {
    voiceId: '29vD33N1CtxCmqQRPOHJ',
    name: 'Drew',
    category: 'premade',
    labels: {
      accent: 'american',
      description: 'well-rounded',
      age: 'middle_aged',
      gender: 'male',
      use_case: 'news',
    },
    previewUrl:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/29vD33N1CtxCmqQRPOHJ/b99fc51d-12d3-4312-b480-a8a45a7d51ef.mp3',
  },
  {
    voiceId: '2EiwWnXFnvU5JabPnv8n',
    name: 'Clyde',
    category: 'premade',
    labels: {
      accent: 'american',
      descriptive: 'intense',
      age: 'middle_aged',
      gender: 'male',
      language: 'en',
      use_case: 'characters_animation',
    },
    description: 'Great for character use-cases',
    previewUrl:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/2EiwWnXFnvU5JabPnv8n/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3',
  },
]

const selectedVoice = ref('21m00Tcm4TlvDq8ikWAM')
const open = ref(false)

function handleValueChange(value: string) {
  selectedVoice.value = value
}
</script>

<template>
  <div class="w-full max-w-lg">
    <VoicePicker
      :voices="voices"
      :model-value="selectedVoice"
      :open="open"
      placeholder="Select a voice..."
      @update:model-value="handleValueChange"
      @update:open="open = $event"
    />
  </div>
</template>
