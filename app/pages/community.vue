<script lang="ts" setup>
import { formatTimeAgo } from '@vueuse/core';

const toast = useToast();
const { token } = useAuth();
const { page, limit, filter, search, filterItems, query } = useDeckSearch();

const totalRecords = computed(
  () => paginated.value?.metadata.totalRecords || 0,
);

const {
  data: paginated,
  error,
  status,
} = await useFetch<Paginated<PublicDeck>, ErrorResponse>('/api/decks/public', {
  query,
  headers: { Authorization: token.value || '' },
});

watch(error, (newErr) => {
  if (newErr) toast.add({ title: 'Error fetching decks' });
});
</script>

<template>
  <SkeletonCommunityPage v-if="status === 'idle' || status === 'pending'" />

  <UContainer v-else class="mt-4 space-y-2">
    <h1 class="mb-4 text-xl font-medium sm:text-2xl">
      Browse decks shared by community
    </h1>

    <div class="flex w-full place-content-between gap-2">
      <UInput
        v-model="search"
        class="sm:basis-1/2"
        icon="i-lucide-search"
        placeholder="Search decks..."
        autofocus
      />

      <USelect v-model="filter" :items="filterItems" value-key="id" />
    </div>

    <div
      v-if="paginated && paginated.metadata.totalRecords > 0"
      class="flex flex-col gap-2 sm:gap-4"
    >
      <TransitionGroup name="list" appear>
        <NuxtLink
          v-for="d in paginated.data"
          :key="d.id"
          :to="`/${d.owner.username}/${d.slug}?deckId=${d.id}`"
        >
          <UCard
            :ui="{ body: 'space-y-6' }"
            class="hover:bg-elevated cursor-pointer shadow-md transition-all hover:scale-101"
            variant="subtle"
          >
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex place-items-center gap-1.5">
                <h4 class="max-w-5/6 truncate font-medium sm:text-lg">
                  {{ d.name }}
                </h4>

                <UIcon
                  :name="getVisibilityIcon(d.visibility)"
                  class="shrink-0 sm:size-5"
                />
              </div>

              <div
                class="flex place-content-start place-items-center gap-2 sm:place-content-end"
              >
                <UTooltip :delay-duration="200" text="Total cards">
                  <UBadge
                    label="123"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-gallery-horizontal-end"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Views">
                  <UBadge
                    label="364"
                    icon="i-lucide-eye"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Cloned times">
                  <UBadge
                    label="318"
                    icon="i-lucide-git-fork"
                    variant="outline"
                    color="neutral"
                  />
                </UTooltip>
              </div>
            </div>

            <UButton
              :to="`/${d.owner.username}`"
              variant="ghost"
              color="neutral"
              class="w-fit p-0"
            >
              <div class="flex place-items-center gap-2">
                <UAvatar :src="d.owner.avatarUrl || ''" />

                <div class="flex flex-col">
                  <p class="text-sm font-medium sm:text-base">
                    {{ d.owner.username }}
                  </p>

                  <p class="text-muted text-sm font-normal">
                    {{ `Created ${formatTimeAgo(new Date(d.createdAt))}` }}
                  </p>
                </div>
              </div>
            </UButton>
          </UCard>
        </NuxtLink>
      </TransitionGroup>
    </div>

    <div
      v-if="Array.isArray(paginated?.data) && paginated.data.length === 0"
      class="mt-12 flex flex-col items-center justify-center text-center"
    >
      <p class="text-muted text-lg">No decks found matching your search.</p>
    </div>

    <UPagination
      v-if="totalRecords > 0"
      v-model:page="page"
      :total="totalRecords"
      :items-per-page="Number(limit)"
      :ui="{ root: 'flex place-content-center mt-6' }"
    />
  </UContainer>
</template>
