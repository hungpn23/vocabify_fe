<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core';

definePageMeta({
  auth: false,
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { token } = useAuth();

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

const throttledToggleFlip = useThrottleFn(toggleFlip, 300);

const isFlipped = ref(false);

const { data: deck, error } = await useFetch<GetSharedOneRes, ErrorResponse>(
  `/api/decks/shared/${route.query.deckId}`,
  {
    headers: { Authorization: token.value || '' },
  },
);

watchImmediate(error, (newErr) => {
  if (newErr) {
    toast.add({ title: newErr.data?.message });
  }
});

async function onAddToLibrary(deckId?: UUID) {
  if (!deckId) return;

  if (!token.value) {
    toast.add({ title: 'Please login first before adding deck to library' });
    router.push('/login');
    return;
  }

  $fetch(`/api/decks/clone/${deckId}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
  })
    .then(() => {
      toast.add({ title: 'Deck added to library' });
      router.push('/library');
    })
    .catch((err: ErrorResponse) => {
      toast.add({ title: err.data?.message });
    });
}

function toggleFlip() {
  isFlipped.value = !isFlipped.value;
}

defineShortcuts({
  ' ': throttledToggleFlip,
});
</script>

<template>
  <UContainer>
    <UButton
      to="/shared"
      class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to shared"
    />

    <h1 class="text-lg font-semibold sm:text-xl">
      {{ deck?.name }}
    </h1>

    <p class="text-muted">
      {{ deck?.description }}
    </p>

    <div class="my-4 flex flex-col gap-4">
      <ClientOnly>
        <UAlert
          :actions="[
            {
              label: 'Add to Library',
              variant: 'subtle',
              icon: 'i-lucide-plus',
              onClick: () => onAddToLibrary(deck?.id),
            },
          ]"
          :orientation="smAndLarger ? 'horizontal' : 'vertical'"
          title="Attention!"
          description="Add this deck to your library for learning."
          icon="i-lucide-terminal"
          color="info"
          variant="outline"
        />
      </ClientOnly>

      <div class="space-y-2">
        <UCard
          :ui="{
            body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
          }"
          class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
          variant="subtle"
          @click="throttledToggleFlip"
        >
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-medium">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
                @click.stop="console.log('TTS not implemented yet')"
              />

              {{ !isFlipped ? 'Term' : 'Definition' }}
            </span>
          </div>

          <div
            v-if="deck && deck.cards[0]"
            class="text-center text-2xl font-semibold sm:px-8 sm:text-3xl"
          >
            {{ !isFlipped ? deck.cards[0].term : deck.cards[0].definition }}
          </div>

          <div />
        </UCard>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="col-span-1 cursor-default">
            <UButton
              v-if="deck"
              class="w-fit p-0 hover:bg-inherit active:bg-inherit"
              variant="ghost"
              color="neutral"
            >
              <div class="flex place-items-center gap-2">
                <UAvatar
                  :ui="{ fallback: 'uppercase' }"
                  :src="deck.owner.avatarUrl || ''"
                  :alt="deck.owner.username"
                  class="cursor-pointer"
                  size="xl"
                />

                <div class="flex flex-col place-items-start">
                  <span class="text-muted text-sm font-normal">Owner</span>

                  <NuxtLink
                    :to="`/shared/${deck.owner.username}`"
                    class="cursor-default text-base font-medium hover:underline sm:text-base"
                  >
                    {{ deck.owner.username }}
                  </NuxtLink>
                </div>
              </div>
            </UButton>
          </div>

          <div
            class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
          >
            <UButton
              label="Skip"
              icon="i-heroicons-x-mark"
              size="lg"
              variant="subtle"
              color="error"
              disabled
            />

            <UButton
              label="Next"
              icon="i-heroicons-check"
              size="lg"
              variant="subtle"
              color="success"
              disabled
            />
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-6" />

    <div v-if="deck" class="space-y-4">
      <h2 class="text-lg font-medium sm:text-xl">
        Cards ({{ deck.totalCards }})
      </h2>

      <TransitionGroup name="list" appear>
        <UCard
          v-for="(card, index) in deck.cards"
          :key="index"
          class="bg-elevated shadow-md"
          variant="subtle"
        >
          <div class="flex flex-col sm:flex-row">
            <p class="w-full text-base font-medium sm:text-lg">
              {{ card.term }}
            </p>

            <USeparator class="m-2 sm:hidden" />

            <USeparator
              orientation="vertical"
              class="m-2 hidden h-auto sm:block"
            />

            <p class="w-full text-base font-medium sm:text-lg">
              {{ card.definition }}
            </p>
          </div>
        </UCard>
      </TransitionGroup>
    </div>
  </UContainer>
</template>

<style scoped></style>
