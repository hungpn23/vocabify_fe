<script setup lang="ts">
import * as v from 'valibot';
import type { SelectMenuItem } from '@nuxt/ui';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const { token, data: user } = useAuth();
const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

const saving = ref(false);
const ignoreDate = ref(false);
const settingOpen = ref(false);
const correctCount = ref(0);
const incorrectCount = ref(0);
const userAnswer = ref('');
const question = ref<Question | undefined>(undefined);

const directionItems = ref<SelectMenuItem[]>([
  {
    label: 'Term to Definition',
    value: 'term_to_def' satisfies QuestionDirection,
  },
  {
    label: 'Definition to Term',
    value: 'def_to_term' satisfies QuestionDirection,
  },
  {
    label: 'Both',
    value: 'both' satisfies QuestionDirection,
  },
]);

const learn = reactive<QuestionState>({
  totalQuestions: 0,
  queue: [],
  retryQueue: [],
  answers: [],
});

const setting = reactive<QuestionSetting>({
  direction: 'term_to_def',
  multipleChoices: true,
  written: false,
});

const progress = computed(() => {
  if (!learn.totalQuestions) return 0;
  return (correctCount.value / learn.totalQuestions) * 100;
});

const deckId = computed(() => route.query.deckId as string);

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const username = computed(() => {
  const n = route.params.username;

  return Array.isArray(n) ? n[0] : n;
});

const questionTypes = computed(() => {
  const types: QuestionType[] = [];

  if (setting.multipleChoices) types.push('multiple_choices');
  if (setting.written) types.push('written');

  return types;
});

const {
  data: deck,
  pending,
  refresh,
} = await useLazyFetch<DeckWithCards>(`/api/decks/${deckId.value}`, {
  headers: { Authorization: token.value || '' },
  server: false,
});

watch(deck, (newDeck) => {
  if (newDeck && newDeck.cards.length > 0) {
    correctCount.value = 0;
    incorrectCount.value = 0;
    settingOpen.value = false;
    userAnswer.value = '';

    learn.answers = [];
    learn.retryQueue = [];

    learn.queue = generateQuestions(
      getCards(newDeck.cards, ignoreDate.value),
      questionTypes.value,
      setting.direction,
    );
    learn.totalQuestions = learn.queue.length;
    question.value = learn.queue.shift();
  }
});

watchDebounced(learn, saveAnswers, {
  debounce: 1000,
  maxWait: 3000,
  deep: true,
});

function handleAnswer(input: string, type: QuestionType) {
  if (!question.value) return;
  if (type === 'written' && !userAnswer.value) return;

  saving.value = true;
  userAnswer.value = ''; // TODO: handle when user submit incorrect answer

  let correct = false;
  if (type === 'multiple_choices') {
    correct = checkMCQAnswer(input, question.value.answer);
  } else if (type === 'written') {
    correct = checkWrittenAnswer(input, question.value.answer);
  }

  const updated = Object.assign(
    {},
    question.value,
    calcCardState({
      ...question.value.state,
      correct,
    }),
  );

  if (correct) {
    correctCount.value++;
  } else {
    incorrectCount.value++;
    learn.retryQueue.push(updated);
  }

  // trigger watchDebounced
  const index = learn.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learn.answers[index] = updated;
  } else {
    learn.answers.push(updated);
  }

  if (!learn.queue.length) {
    if (!learn.retryQueue.length) {
      question.value = undefined;
      return;
    }

    learn.queue = learn.retryQueue;
    learn.retryQueue = [];
  }

  question.value = learn.queue.shift();
}

async function saveAnswers() {
  const answersToSave = [...learn.answers];
  if (answersToSave.length === 0) return;

  $fetch(`/api/study/save-answer/${deckId.value}`, {
    method: 'POST',
    headers: { Authorization: token.value || '' },
    body: { answers: answersToSave },
  })
    .then(() => (learn.answers = []))
    .catch((error: ErrorResponse) => {
      console.error('Save answers fail!', error.data);
    })
    .finally(() => (saving.value = false));
}

async function onRestart() {
  $fetch(`/api/decks/restart/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  }).then(async () => {
    ignoreDate.value = false;
    await refresh();
  });
}

async function onIgnoreDate() {
  ignoreDate.value = true;
  await refresh();
}

const throttledHandleAnswer = useThrottleFn(handleAnswer, 500);

defineShortcuts({
  enter: () => throttledHandleAnswer(userAnswer.value, 'written'),
  '1': () => {
    const choice = question.value?.choices?.[0];
    if (choice) throttledHandleAnswer(choice, 'multiple_choices');
  },
  '2': () => {
    const choice = question.value?.choices?.[1];
    if (choice) throttledHandleAnswer(choice, 'multiple_choices');
  },
  '3': () => {
    const choice = question.value?.choices?.[2];
    if (choice) throttledHandleAnswer(choice, 'multiple_choices');
  },
  '4': () => {
    const choice = question.value?.choices?.[3];
    if (choice) throttledHandleAnswer(choice, 'multiple_choices');
  },
});
</script>

<template>
  <ClientOnly>
    <UContainer>
      <div class="flex place-content-between place-items-center gap-2">
        <UButton
          :to="`/${username}/${deckSlug}/flashcards?deckId=${deckId}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          icon="i-lucide-move-left"
          label="Back to Flashcards"
        />

        <UButton
          :to="`/${username}/${deckSlug}/test?deckId=${deckId}`"
          class="mt-2 cursor-pointer px-0 text-base"
          variant="link"
          trailing-icon="i-lucide-move-right"
          label="Go to Test"
        />
      </div>

      <div v-if="pending" class="flex justify-center p-10">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
      </div>

      <div v-else-if="question" class="mb-8 flex w-full flex-col gap-2">
        <div class="mb-2 flex place-content-center place-items-center gap-2">
          <h1 class="text-lg font-semibold sm:text-xl">
            {{ deck?.name || '' }}
          </h1>

          <UIcon
            v-if="!saving"
            name="i-lucide-check"
            class="text-success size-5"
          />

          <span v-else class="text-base">Saving...</span>
        </div>

        <div class="flex place-content-between">
          <div class="flex place-items-center gap-2">
            <UBadge
              :label="incorrectCount"
              class="rounded-full px-2"
              variant="subtle"
              color="error"
            />

            <span class="text-error text-sm">Incorrect</span>
          </div>

          <div>{{ `${correctCount} / ${learn.totalQuestions}` }}</div>

          <div class="flex place-items-center gap-2">
            <span class="text-success text-accented text-sm">Correct</span>

            <UBadge
              :label="correctCount"
              class="rounded-full px-2"
              variant="subtle"
              color="success"
            />
          </div>
        </div>

        <UCard
          :ui="{
            header: 'p-0 sm:px-0',
            body: 'flex-1 w-full flex flex-col gap-2 sm:gap-4 place-content-between',
          }"
          class="flex min-h-[50dvh] flex-col divide-none shadow-md"
        >
          <div class="flex w-full place-content-between place-items-center">
            <span class="flex place-items-center gap-1 font-semibold">
              <UButton
                class="hover:text-primary cursor-pointer rounded-full bg-inherit p-2"
                icon="i-lucide-volume-2"
                variant="soft"
                color="neutral"
              />
              Term
            </span>

            <UButton
              class="cursor-pointer"
              icon="i-lucide-lightbulb"
              variant="ghost"
              color="neutral"
            >
              Get a hint
            </UButton>
          </div>

          <div class="text-xl font-medium sm:text-2xl">
            {{ question.question }}
          </div>

          <div class="mt-4 flex w-full flex-col gap-2 sm:gap-4">
            <span class="font-bold">
              {{
                question.type === 'multiple_choices'
                  ? 'Choose an answer'
                  : 'Type your answer'
              }}
            </span>

            <div
              v-if="question.choices"
              class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
            >
              <UButton
                v-for="(choice, index) in question.choices"
                :key="index"
                variant="outline"
                color="neutral"
                class="flex w-full cursor-pointer place-items-center gap-2 rounded-lg p-3 transition-all hover:scale-102 hover:shadow active:scale-95"
                @click="throttledHandleAnswer(choice, 'multiple_choices')"
              >
                <UBadge
                  class="hidden h-8 w-8 shrink-0 place-content-center place-items-center rounded-full bg-inherit font-bold sm:flex"
                  variant="outline"
                  color="neutral"
                >
                  {{ index + 1 }}
                </UBadge>

                <span class="text-start text-lg font-medium">
                  {{ choice }}
                </span>
              </UButton>
            </div>

            <UInput
              v-else
              v-model="userAnswer"
              :ui="{ base: 'text-lg sm:text-xl' }"
              class="w-full"
              variant="outline"
              placeholder="Type your answer here..."
              autofocus
            />

            <div class="flex place-content-end place-items-center gap-4">
              <UButton
                class="cursor-pointer place-self-end font-medium"
                variant="ghost"
                tabindex="-1"
              >
                Don't know?
              </UButton>

              <UButton
                v-if="question.type === 'written'"
                :disabled="!userAnswer"
                class="cursor-pointer font-medium"
                @click="throttledHandleAnswer(userAnswer, 'written')"
              >
                Answer
              </UButton>
            </div>
          </div>

          <template #header>
            <UProgress
              v-model="progress"
              :ui="{ base: 'bg-inherit' }"
              size="sm"
            />
          </template>
        </UCard>

        <UModal
          v-model:open="settingOpen"
          :fullscreen="!smAndLarger"
          :ui="{
            content: 'divide-none',
            body: 'flex-initial pt-0 sm:pt-0',
            footer: 'place-content-end',
          }"
          :description="deck?.name || ''"
        >
          <UButton
            :size="smAndLarger ? 'xl' : 'lg'"
            class="cursor-pointer place-self-end"
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            @click="settingOpen = true"
          />

          <template #title>
            <h2 class="text-2xl font-semibold sm:text-3xl">Settings</h2>
          </template>

          <template #body>
            <div class="flex flex-col gap-2 text-base font-medium sm:text-lg">
              <USeparator label="Question format" />

              <div class="flex place-content-between place-items-center gap-2">
                <div>Multiple choices</div>

                <USwitch v-model="setting.multipleChoices" size="lg" />
              </div>

              <div class="flex place-content-between place-items-center gap-2">
                <div>Written</div>

                <USwitch v-model="setting.written" size="lg" />
              </div>

              <USeparator label="Answer format" />

              <div class="flex place-content-between place-items-center gap-2">
                <div>Answer with</div>

                <USelect
                  v-model="setting.direction"
                  :items="directionItems"
                  :ui="{ content: 'min-w-fit' }"
                  size="lg"
                />
              </div>
            </div>
          </template>

          <template #footer>
            <UButton
              class="cursor-pointer"
              label="Apply"
              color="neutral"
              size="lg"
              @click="async () => await refresh()"
            />
          </template>
        </UModal>
      </div>

      <UEmpty
        v-else
        :actions="[
          {
            to: '/home',
            icon: 'i-lucide-house',
            label: 'Home',
            color: 'success',
            variant: 'subtle',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
          },
          {
            icon: 'i-lucide-refresh-cw',
            label: 'Restart',
            color: 'error',
            variant: 'outline',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: onRestart,
          },
          {
            icon: 'i-lucide-fast-forward',
            label: 'Ignore & continue',
            color: 'neutral',
            variant: 'subtle',
            class: 'cursor-pointer hover:scale-102 hover:shadow',
            onClick: onIgnoreDate,
          },
        ]"
        variant="naked"
        icon="i-lucide-party-popper"
        title="You're all caught up — nothing to review now."
        description="Optimize your retention by strictly adhering to the next review date."
        size="xl"
      />
    </UContainer>
  </ClientOnly>
</template>
