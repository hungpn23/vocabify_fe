<script setup lang="ts">
import type {
  DropdownMenuItem,
  FormErrorEvent,
  FormSubmitEvent,
} from '@nuxt/ui';
import { CardStatus } from '~/utils/enums';
import { formatDistanceToNowStrict } from 'date-fns';
import { DeckWithCardsSchema } from '~~/shared/types/deck';

// --- Form State ---

const transitionName = ref<'slide-left' | 'slide-right'>('slide-right');

const formErrorMsg = ref('');
const isEditing = ref(false);
const isSaving = ref(false);
// const form = useTemplateRef('form');

const deckState = reactive<Partial<DeckWithCards>>({});

// --- Learning State ---
const isFlipped = ref(false);
const shortcutPressed = ref(false);
const correctAnswersCount = ref(0);
const flashcard = ref<Card | undefined>(undefined);

const learnState = reactive<FlashcardState>({
  totalCards: 0,
  flashcards: [],
  answers: [],
  retryCards: [],
});

// --- Computed Properties ---

const deckId = computed(() => {
  const q = useRoute().query.deckId;

  return Array.isArray(q) ? q[0] : q;
});

const progress = computed(() => {
  if (!learnState.totalCards) return 0;

  return (correctAnswersCount.value / learnState.totalCards) * 100;
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil-line',
      disabled: isEditing.value,
      onSelect: startEditing,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: onDeckDelete,
    },
  ],
]);

// --- Static ---

const studyItems = [
  {
    label: 'Flashcards',
    icon: 'i-lucide-file-plus',
  },
  {
    label: 'Learn',
    icon: 'i-lucide-book-marked',
  },
  {
    label: 'Test',
    icon: 'i-lucide-book-check',
  },
  {
    label: 'Comming soon',
    icon: '',
  },
];

// --- Hooks / Fetching Data ---

const toast = useToast();
const router = useRouter();
const { token, data: user } = useAuth();
const {
  data: res,
  error,
  status: fetchStatus,
  refresh: refreshDeckData,
} = await useLazyFetch<DeckWithCards, ErrorResponse>(
  `/api/decks/${deckId.value}`,
  {
    headers: {
      Authorization: token.value || '',
    },
    server: false,
  },
);

// --- Watchers ---

watch(res, (newRes) => {
  if (newRes) {
    resetFormState(newRes);

    shortcutPressed.value = false;
    correctAnswersCount.value = 0;
    learnState.answers = [];
    learnState.retryCards = [];
    learnState.flashcards = structuredClone(newRes.cards).filter(
      (c) => !c.nextReviewDate || Date.parse(c.nextReviewDate) < Date.now(),
    );
    learnState.totalCards = learnState.flashcards.length;
    flashcard.value = learnState.flashcards.shift();

    toast.add({
      title: 'Flashcard data initialized successfully.',
      color: 'success',
      duration: 2000,
    });
  }
});

watch(flashcard, () => {
  isFlipped.value = false;
});

watch(fetchStatus, (newStatus) => {
  if (newStatus === 'error') {
    toast.add({
      title: 'Error fetching decks',
      description: JSON.stringify(error.value?.data || 'Unknown error'),
      color: 'error',
      duration: 2000,
    });
  }
});

watchDebounced(learnState, saveAnswers, {
  debounce: 1000,
  maxWait: 3000,
  deep: true,
});

if (fetchStatus.value === 'error') {
}

// --- Form Functions ---

function startEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  resetFormState(res.value);
  // form.value?.clear();
  formErrorMsg.value = '';

  toast.add({
    title: 'Editing canceled successfully.',
    color: 'success',
    duration: 2000,
  });
}

function resetFormState(newRes?: DeckWithCards) {
  if (newRes) {
    deckState.name = newRes.name;
    deckState.description = newRes.description || '';
    deckState.cards = structuredClone(newRes.cards);
  }
}

function addCardFirst() {
  deckState.cards?.unshift({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    correctCount: 0,
    nextReviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added first successfully.',
    color: 'success',
    duration: 2000,
  });
}

function addCardLast() {
  deckState.cards?.push({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    correctCount: 0,
    nextReviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added last successfully.',
    color: 'success',
    duration: 2000,
  });
}

function deleteCard(cardId?: UUID) {
  deckState.cards = deckState.cards?.filter((c) => c.id !== cardId);
}

function goToHome() {
  router.push(`/home`);

  toast.add({
    title: 'Go to successfully.',
    color: 'success',
    duration: 2000,
  });
}

async function onDeckDelete() {
  $fetch(`/api/decks/${deckId.value}`, {
    method: 'DELETE',
    headers: {
      Authorization: token.value || '',
    },
  })
    .then(goToHome)
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error deleting deck',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    });
}

async function onSubmit(event: FormSubmitEvent<DeckWithCards>) {
  if (isSaving.value) return;
  isSaving.value = true;

  $fetch(`/api/decks/${deckId.value}`, {
    method: 'PATCH',
    headers: {
      Authorization: token.value || '',
    },
    body: event.data,
  })
    .then(async () => {
      isEditing.value = false;
      await refreshDeckData();

      toast.add({
        title: 'Changes saved successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error saving changes',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });

      return;
    })
    .finally(() => {
      formErrorMsg.value = '';
      isSaving.value = false;
    });
}

async function onError(event: FormErrorEvent) {
  const formError = event.errors.find((e) => e.name === '');

  formErrorMsg.value = formError
    ? formError.message
    : 'Please fill in all required fields.';
}

// --- Learning Logic Functions ---

function toggleFlip() {
  if (!flashcard.value) return;
  if (!shortcutPressed.value) shortcutPressed.value = true;

  isFlipped.value = !isFlipped.value;
}

function handleAnswer(isCorrect: boolean) {
  if (!flashcard.value) return;

  transitionName.value = isCorrect ? 'slide-right' : 'slide-left';

  const updated = Object.assign(
    {},
    flashcard.value,
    calcCardState({
      ...flashcard.value,
      isCorrect,
    }),
  );

  // handle isCorrect & retryCards
  isCorrect ? correctAnswersCount.value++ : learnState.retryCards.push(updated);

  // handle answers
  const index = learnState.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learnState.answers[index] = updated;
  } else {
    learnState.answers.push(updated);
  }

  // handle flashcards
  if (!learnState.flashcards.length) {
    if (!learnState.retryCards.length) {
      flashcard.value = undefined;
      return;
    }

    learnState.flashcards = learnState.retryCards;
    learnState.retryCards = [];
  }

  // next flashcard
  flashcard.value = learnState.flashcards.shift();
}

async function refreshDeckProgress() {
  $fetch(`/api/decks/refresh/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  })
    .then(async () => {
      await refreshDeckData();

      toast.add({
        title: 'refreshDeckProgress successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error refreshing deck!',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    });
}

async function saveAnswers() {
  if (learnState.answers.length === 0) return;

  $fetch(`/api/study/save-answer/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
    body: { answers: learnState.answers },
  })
    .then(() => {
      const map = new Map(learnState.answers.map((a) => [a.id, a]));

      if (deckState.cards?.length) {
        for (const c of deckState.cards) {
          const answer = map.get(c.id);

          if (answer) {
            Object.assign(c, {
              ...answer,
              status: calcCardStatus(answer.nextReviewDate),
            });
          }
        }
      }

      learnState.answers = [];

      toast.add({
        title: 'Auto saveAnswers successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      console.error('Failed to save answers:', error.data);
    });
}

async function ignoreNextReviewDate() {
  await refreshDeckData();
  learnState.flashcards = structuredClone(res.value?.cards || []);
  learnState.totalCards = learnState.flashcards.length;
  flashcard.value = learnState.flashcards.shift();
}

// --- Shortcuts/Side Effects ---

const throttledToggleFlip = useThrottleFn(toggleFlip, 200);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 200);

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <Transition :name="transitionName" mode="out-in">
    <UCard
      :key="flashcard?.id"
      :ui="{
        body: 'grow flex place-items-center text-left text-2xl font-semibold px-6 sm:px-12 sm:text-3xl',
      }"
      variant="soft"
      class="bg-elevated flex min-h-[50dvh] w-full flex-col place-items-center divide-none text-center will-change-transform"
      @click="throttledToggleFlip"
    >
      {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
    </UCard>
  </Transition>
</template>

<style scoped>
/* Cấu hình chung cho tốc độ animation */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

/* --- TRƯỜNG HỢP SAI (Left) --- */

/* Trạng thái khi card bắt đầu rời đi (được đánh dấu là SAI) */
.slide-left-leave-active {
  /* Áp dụng viền đỏ và hiệu ứng rung nhẹ nếu muốn */
  @apply border-red-500 bg-red-50/50 ring-2 ring-red-500 dark:bg-red-900/20;
}

/* Đích đến khi rời đi: Bay sang trái và mờ dần */
.slide-left-leave-to {
  transform: translateX(-50%) rotate(-10deg); /* Bay sang trái + xoay nhẹ */
  opacity: 0;
}

/* Trạng thái thẻ mới xuất hiện (từ bên phải bay vào để lấp chỗ) */
.slide-left-enter-from {
  transform: translateX(50%);
  opacity: 0;
}

/* --- TRƯỜNG HỢP ĐÚNG (Right) --- */

/* Trạng thái khi card bắt đầu rời đi (được đánh dấu là ĐÚNG) */
.slide-right-leave-active {
  /* Áp dụng viền xanh */
  @apply border-green-500 bg-green-50/50 ring-2 ring-green-500 dark:bg-green-900/20;
}

/* Đích đến khi rời đi: Bay sang phải */
.slide-right-leave-to {
  transform: translateX(50%) rotate(10deg); /* Bay sang phải + xoay nhẹ */
  opacity: 0;
}

/* Trạng thái thẻ mới xuất hiện (từ bên trái bay vào) */
.slide-right-enter-from {
  transform: translateX(-50%);
  opacity: 0;
}
</style>
