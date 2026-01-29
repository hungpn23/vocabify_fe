<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual("sm");

const isShortcutOpen = ref(false);
</script>

<template>
  <UModal
    v-model:open="isShortcutOpen"
    :ui="{
      content: 'divide-none',
      body: 'flex-initial pt-0 sm:pt-0',
      footer: 'place-content-end',
    }"
    description="It helpful!"
  >
    <UButton
      v-if="smAndLarger"
      class="cursor-pointer"
      icon="i-lucide-keyboard"
      variant="ghost"
      color="neutral"
      size="lg"
      @click="isShortcutOpen = true"
    />

    <template #title>
      <span class="text-lg font-medium sm:text-xl">Keyboard shortcuts</span>
    </template>

    <template #body>
      <div class="flex flex-col gap-2">
        <div class="flex place-content-between place-items-center gap-2">
          <div>Toggle color mode</div>

          <div class="flex place-items-center">
            <AppKbd label="`" />
          </div>
        </div>

        <USeparator label="Flashcard" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Flip card</div>

          <div class="flex place-items-center">
            <AppKbd label="Space" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Skip/Next card</div>

          <div class="flex place-items-center">
            <AppKbd :icon="{ name: 'i-lucide-move-left' }" />,
            <AppKbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>

        <USeparator label="Learning" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Choose an answer</div>

          <div class="flex place-items-center">
            <AppKbd label="1" />,<AppKbd label="2" />,
            <AppKbd label="3" />,<AppKbd label="4" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Get a hint</div>

          <div class="place-items center flex">
            <AppKbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <AppKbd label="Shift" />
            <AppKbd label="/" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Skip</div>

          <div class="place-items center flex">
            <AppKbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <AppKbd label="Shift" />
            <AppKbd label="X" />
          </div>
        </div>

        <USeparator label="Test" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Previous/Next question</div>

          <div class="flex place-items-center">
            <AppKbd :icon="{ name: 'i-lucide-move-left' }" />,
            <AppKbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Mark as don't know</div>

          <div class="place-items center flex">
            <AppKbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <AppKbd label="Shift" />
            <AppKbd label="X" />
          </div>
        </div>

        <USeparator label="Routing" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Go back/forward</div>

          <div class="place-items center flex">
            <AppKbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <AppKbd :icon="{ name: 'i-lucide-move-left' }" />,
            <AppKbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
