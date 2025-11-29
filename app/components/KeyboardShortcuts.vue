<script lang="ts" setup>
import { breakpointsTailwind } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

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
      <span class="text-xl font-semibold sm:text-2xl">Keyboard shortcuts</span>
    </template>

    <template #body>
      <div class="flex flex-col gap-2 font-semibold">
        <div class="flex place-content-between place-items-center gap-2">
          <div>Toggle color mode</div>

          <div class="flex place-items-center">
            <Kbd label="`" />
          </div>
        </div>

        <USeparator label="Flashcard" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Flip card</div>

          <div class="flex place-items-center">
            <Kbd label="Space" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Skip/Next card</div>

          <div class="flex place-items-center">
            <Kbd :icon="{ name: 'i-lucide-move-left' }" />/
            <Kbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>

        <USeparator label="Learning" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Choose an answer</div>

          <div class="flex place-items-center">
            <Kbd label="1" />/ <Kbd label="2" />/ <Kbd label="3" />/
            <Kbd label="4" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Get a hint</div>

          <div class="place-items center flex">
            <Kbd label="Shift" />+
            <Kbd label="/" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Mark as don't know</div>

          <div class="place-items center flex">
            <Kbd label="Shift" />+
            <Kbd label="X" />
          </div>
        </div>

        <USeparator label="Test" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Previous/Next question</div>

          <div class="flex place-items-center">
            <Kbd :icon="{ name: 'i-lucide-move-left' }" />/
            <Kbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>

        <USeparator label="Routing" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Go back/forward</div>

          <div class="place-items center flex">
            <Kbd :icon="{ name: 'i-lucide-command', size: 4 }" />+
            <Kbd :icon="{ name: 'i-lucide-move-left' }" />/
            <Kbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
