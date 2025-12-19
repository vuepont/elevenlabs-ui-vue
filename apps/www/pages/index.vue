<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import ExamplesRoot from '@/components/examples/ExamplesRoot.vue'

const title = 'ElevenLabs UI'
const description = 'A collection of Open Source agent and audio components that you can customize and extend.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="flex flex-1 flex-col">
    <PageHeader>
      <PageHeaderHeading class="max-w-4xl">
        {{ title }}
      </PageHeaderHeading>
      <PageHeaderDescription>{{ description }}</PageHeaderDescription>
      <PageActions>
        <Button as-child size="sm">
          <NuxtLink to="/docs/installation">
            Get Started
          </NuxtLink>
        </Button>
        <Button as-child size="sm" variant="ghost">
          <NuxtLink to="/docs/components">
            View Components
          </NuxtLink>
        </Button>
      </PageActions>
    </PageHeader>
    <PageNav class="hidden md:flex">
      <!-- <ExamplesNav class="[&>a:first-child]:text-primary flex-1 overflow-hidden" /> -->
      <!-- <ThemeSelector class="ml-auto mr-4 hidden md:flex" /> -->
    </PageNav>
    <div class="container-wrapper section-soft flex-1 pb-6">
      <div class="container overflow-hidden">
        <section class="theme-container hidden md:block">
          <ExamplesRoot />
        </section>
      </div>
    </div>
  </div>
</template>
