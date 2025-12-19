<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'

const title = 'Blocks'
const description
  = 'A collection of building blocks for agents and audio that you can customize and extend.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <PageHeader>
    <PageHeaderHeading>{{ title }}</PageHeaderHeading>
    <PageHeaderDescription>{{ description }}</PageHeaderDescription>
    <PageActions>
      <Button as-child size="sm">
        <a href="#blocks">Browse Blocks</a>
      </Button>
      <Button as-child variant="ghost" size="sm">
        <a href="https://github.com/peoray/elevenlabs-ui-vue" target="_blank" rel="noopener noreferrer">
          Add a block
        </a>
      </Button>
    </PageActions>
  </PageHeader>
  <PageNav id="blocks">
    <BlocksNav />
  </PageNav>
  <div class="container-wrapper section-soft flex-1 md:py-12">
    <div class="container">
      <NuxtPage />
    </div>
  </div>
</template>
