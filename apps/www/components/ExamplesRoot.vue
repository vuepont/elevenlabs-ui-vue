<script setup lang="ts">
import MusicPlayer01 from '@repo/blocks/music-player-01/page.vue'
import MusicPlayer02 from '@repo/blocks/music-player-02/page.vue'
import Speaker01 from '@repo/blocks/speaker-01/page.vue'
import VoiceChat01 from '@repo/blocks/voice-chat-01/page.vue'
import VoiceChat02 from '@repo/blocks/voice-chat-02/page.vue'
import { ConversationBar } from '@repo/elements/conversation-bar'
import {
  BarVisualizerSimple,
  Conversation,
  LiveRecording,
  Orb as OrbDemo,
  ShimmeringText,
  VoicePicker,
  Waveform,
} from '@repo/examples'

const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''
</script>

<template>
  <div class="theme-container mx-auto grid md:gap-4 py-1 lg:grid-cols-10 xl:grid-cols-11">
    <div class="grid gap-4 lg:col-span-4 xl:col-span-6">
      <div class="grid gap-3 sm:grid-cols-[auto_1fr] md:hidden">
        <VoiceChat02 />
        <div class="pt-3 sm:pt-0 sm:pl-2 xl:pl-4">
          <BarVisualizerSimple />
        </div>
        <div class="pt-3 sm:col-span-2 xl:pt-4">
          <LiveRecording />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div class="flex flex-col gap-4">
          <BarVisualizerSimple />
          <ShimmeringText />
          <OrbDemo small />
          <VoicePicker />
          <Waveform />
        </div>
        <div class="flex flex-col gap-4">
          <Speaker01 />
          <div class="lg:hidden xl:block">
            <Conversation />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 lg:col-span-6 xl:col-span-5">
      <div class="hidden gap-1 sm:grid-cols-2 md:grid">
        <VoiceChat02 />
        <div class="pt-3 sm:pt-0 sm:pl-2 xl:pl-3">
          <MusicPlayer02 />

          <div class="pt-3">
            <LiveRecording />
          </div>
          <div class="pt-3">
            <ConversationBar :agent-id="agentId" class="p-0" />
          </div>
        </div>
        <div class="pt-3 sm:col-span-2 xl:pt-3">
          <MusicPlayer01 />
        </div>
      </div>
      <div class="hidden md:block">
        <VoiceChat01 />
      </div>
      <div class="hidden lg:block xl:hidden">
        <Conversation />
      </div>
    </div>
  </div>
</template>
