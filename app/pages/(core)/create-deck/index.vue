<script lang="ts" setup>
import * as v from 'valibot';
import type { FormErrorEvent, FormSubmitEvent, SelectMenuItem } from '@nuxt/ui';

const createSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  description: v.string(),
  visibility: v.enum(Visibility),
  passcode: v.nullish(
    v.pipe(
      v.string(),
      v.minLength(4, 'Passcode must be at least 4 characters'),
      v.maxLength(20, 'Passcode must be at most 20 characters'),
    ),
  ),
  cards: v.pipe(
    v.array(
      v.object({
        term: v.pipe(v.string(), v.minLength(1, 'Term is required')),
        definition: v.pipe(
          v.string(),
          v.minLength(1, 'Definition is required'),
        ),
      }),
    ),
    v.minLength(4, 'At least 4 cards are required'),
  ),
});

const importSchema = v.object({
  cards: v.pipe(v.string(), v.minLength(1, 'Cards are required')),
});

type CreateSchema = v.InferOutput<typeof createSchema>;
type ImportSchema = v.InferOutput<typeof importSchema>;

const router = useRouter();
const toast = useToast();
const { token } = useAuth();

const passcodeInput = useTemplateRef('passcodeInput');

const visibilityItems = ref<(SelectMenuItem & { id: Visibility })[]>([
  {
    id: Visibility.PUBLIC,
    label: getVisibilityLabel(Visibility.PUBLIC),
  },
  {
    id: Visibility.PROTECTED,
    label: getVisibilityLabel(Visibility.PROTECTED),
  },
  {
    id: Visibility.PRIVATE,
    label: getVisibilityLabel(Visibility.PRIVATE),
  },
]);

const contentSeparatorItems = ref<SelectMenuItem[]>([
  {
    id: 'tab' satisfies ContentSeparator,
    label: 'Tab',
  },
  {
    id: 'comma' satisfies ContentSeparator,
    label: 'Comma',
  },
  {
    id: 'custom' satisfies ContentSeparator,
    label: 'Custom',
  },
]);

const cardSeparatorItems = ref<(SelectMenuItem & { id: CardSeparator })[]>([
  {
    id: 'new_line' satisfies CardSeparator,
    label: 'New line',
  },
  {
    id: 'semicolon' satisfies CardSeparator,
    label: 'Semicolon',
  },
  {
    id: 'custom' satisfies CardSeparator,
    label: 'Custom',
  },
]);

const isVisibilityModalOpen = ref(false);
const isImportModalOpen = ref(false);
const isSubmitting = ref(false);
const formErrorMsg = ref('');

const createState = reactive<CreateSchema>({
  name: '',
  description: '',
  visibility: Visibility.PUBLIC,
  passcode: null,
  cards: [
    { term: '', definition: '' },
    { term: '', definition: '' },
    { term: '', definition: '' },
  ],
});

const importState = reactive({
  cards: '',
  contentSeparator: 'tab' as ContentSeparator,
  cardSeparator: 'new_line' as CardSeparator,
  customContentSeparator: '-',
  customCardSeparator: '\\',
});

const contentSeparatorPreview = computed(
  () =>
    `Term${getContentSeparator(
      importState.contentSeparator,
      importState.customContentSeparator,
    )}Definition`,
);

const cardSeparatorPreview = computed(
  () =>
    `Card1${getCardSeparator(
      importState.cardSeparator,
      importState.customCardSeparator,
    )}Card2`,
);

const parsedCards = computed(() => {
  const sep = getContentSeparator(
    importState.contentSeparator,
    importState.customContentSeparator,
  );
  const cardSep = getCardSeparator(
    importState.cardSeparator,
    importState.customCardSeparator,
  );

  if (!importState.cards || !sep || !cardSep) return [];

  const cards = importState.cards
    .split(cardSep)
    .filter((card) => card.trim().length > 0);

  return cards.map((card) => {
    const [term = '', definition = ''] = card.split(sep);

    return { term, definition };
  });
});

watch(
  () => createState.visibility,
  (newVisibility) => {
    createState.passcode =
      newVisibility === Visibility.PROTECTED ? '' : undefined;
  },
);

function onPasscodeInputMounted() {
  setTimeout(() => {
    passcodeInput.value?.inputRef?.focus();
  }, 300);
}

async function onCreate(event: FormSubmitEvent<CreateSchema>) {
  formErrorMsg.value = '';
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  $fetch<CreateDeckRes>('/api/decks', {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
    body: event.data,
  })
    .then(() => {
      router.push('/library');

      toast.add({
        title: 'New deck created!',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Create failed!',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

async function onImportSubmit(event: FormSubmitEvent<ImportSchema>) {
  const sep = getContentSeparator(
    importState.contentSeparator,
    importState.customContentSeparator,
  );

  const cardSep = getCardSeparator(
    importState.cardSeparator,
    importState.customCardSeparator,
  );

  if (!sep || !cardSep) {
    toast.add({
      title: 'Error importing cards',
      description: 'Invalid custom content or card separator',
      color: 'error',
      duration: 2000,
    });

    return;
  }

  const importCards = event.data.cards
    .split(cardSep)
    .filter((card) => card.trim().length > 0)
    .map((card) => {
      const [term = '', definition = ''] = card.split(sep);

      return { term, definition };
    });

  const currentCards = createState.cards.filter(
    (c) => c.term.trim().length > 0 || c.definition.trim().length > 0,
  );

  createState.cards = [...currentCards, ...importCards];

  isImportModalOpen.value = false;

  toast.add({
    title: 'Successfully imported!',
    color: 'success',
    duration: 2000,
  });
}

async function onError(event: FormErrorEvent) {
  const cardError = event.errors.find((e) => e.name === 'cards');

  formErrorMsg.value = cardError
    ? cardError.message
    : 'Please fill in all required fields.';
}
</script>

<template>
  <UContainer class="space-y-2">
    <UButton
      to="/library"
      class="cursor-pointer px-0 text-base"
      variant="link"
      icon="i-lucide-move-left"
      label="Back to home"
    />

    <div class="space-y-2">
      <div class="flex place-content-between place-items-center gap-2">
        <h1 class="text-xl font-semibold text-nowrap sm:text-2xl">
          Create a new deck
        </h1>

        <UButton
          class="cursor-pointer"
          icon="i-lucide-plus"
          label="Create"
          color="primary"
          type="submit"
          form="create-deck-form"
        />
      </div>

      <UAlert
        v-if="formErrorMsg"
        :description="formErrorMsg"
        icon="i-lucide-alert-triangle"
        color="error"
        variant="soft"
        title="Validation Error"
      />
    </div>

    <UForm
      id="create-deck-form"
      :schema="createSchema"
      :state="createState"
      class="mt-4 flex flex-col gap-2"
      @submit="onCreate"
      @error="onError"
    >
      <UFormField label="Name" name="name" required>
        <UInput
          v-model="createState.name"
          :ui="{ base: 'sm:text-lg' }"
          class="w-full"
          variant="subtle"
          placeholder="Enter a name, like “Biology - Chapter 22: Evolution”"
        />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea
          v-model="createState.description"
          :rows="1"
          :maxrows="5"
          :ui="{ base: 'sm:text-lg' }"
          class="w-full"
          placeholder="Describe your deck (optional)"
          variant="subtle"
          autoresize
        />
      </UFormField>

      <UModal
        v-model:open="isVisibilityModalOpen"
        :ui="{ title: 'text-lg sm:text-xl' }"
        class="mt-2 w-fit"
        title="Manage your deck access"
      >
        <UButton
          :label="getVisibilityLabel(createState.visibility)"
          :icon="getVisibilityIcon(createState.visibility)"
          class="cursor-pointer"
          variant="subtle"
          color="neutral"
        />

        <template #body>
          <UFormField
            :help="getVisibilityDesc(createState.visibility)"
            label="Visibility"
            name="visibility"
          >
            <USelect
              v-model="createState.visibility"
              :items="visibilityItems"
              :icon="getVisibilityIcon(createState.visibility)"
              :ui="{ content: 'min-w-fit' }"
              value-key="id"
              variant="subtle"
            />
          </UFormField>

          <UFormField
            v-if="createState.visibility === Visibility.PROTECTED"
            class="mt-2"
            label="Passcode"
            name="passcode"
            required
          >
            <UInput
              ref="passcodeInput"
              v-model="createState.passcode"
              placeholder="Enter your passcode..."
              @keydown.enter="isVisibilityModalOpen = false"
              @vue:mounted="onPasscodeInputMounted"
            />
          </UFormField>
        </template>
      </UModal>

      <div class="mt-2 flex place-content-between place-items-center gap-4">
        <h2 class="font-medium sm:text-lg">
          Cards ({{ createState.cards.length }})
        </h2>

        <UModal
          v-model:open="isImportModalOpen"
          :ui="{
            title: 'text-xl sm:text-2xl',
            content:
              'sm:inset-x-16 sm:inset-y-8 lg:inset-x-32 lg:inset-y-16 sm:rounded-md',
          }"
          class="w-fit"
          title="Import your cards"
          description="Copy and Paste your data here (from Word, Excel, Google Docs, CSV Files, etc.)"
          fullscreen
        >
          <UButton
            class="cursor-pointer"
            label="Import cards"
            icon="i-lucide-download"
            variant="soft"
            color="secondary"
          />

          <template #body>
            <UForm
              id="import-form"
              :schema="importSchema"
              :state="importState"
              class="flex flex-col gap-4"
              @submit="onImportSubmit"
            >
              <UFormField name="cards">
                <UTextarea
                  v-model="importState.cards"
                  :rows="7"
                  :maxrows="10"
                  class="w-full"
                  variant="subtle"
                  placeholder="Paste your data here..."
                  autoresize
                  autofocus
                />
              </UFormField>

              <div
                class="flex flex-col place-items-start gap-3 sm:flex-row sm:gap-6"
              >
                <div class="flex place-items-center gap-2">
                  <UFormField
                    :ui="{
                      help: 'whitespace-pre-wrap',
                    }"
                    :help="contentSeparatorPreview"
                    name="contentSeparator"
                  >
                    <USelect
                      v-model="importState.contentSeparator"
                      :items="contentSeparatorItems"
                      class="w-full"
                      variant="subtle"
                      value-key="id"
                    />

                    <template #label>
                      <h3 class="truncate font-semibold sm:text-lg">
                        Content separator
                      </h3>
                    </template>
                  </UFormField>

                  <UFormField
                    v-if="importState.contentSeparator === 'custom'"
                    name="customContentSeparator"
                  >
                    <UInput
                      v-model="importState.customContentSeparator"
                      class="mt-1"
                      placeholder="eg. -"
                    />
                  </UFormField>
                </div>

                <div class="flex place-items-center gap-2">
                  <UFormField
                    :ui="{
                      help: 'whitespace-pre-wrap',
                    }"
                    :help="cardSeparatorPreview"
                    name="cardSeparator"
                  >
                    <USelect
                      v-model="importState.cardSeparator"
                      :items="cardSeparatorItems"
                      class="w-full"
                      variant="subtle"
                      value-key="id"
                    />

                    <template #label>
                      <h3 class="truncate font-semibold sm:text-lg">
                        Card separator
                      </h3>
                    </template>
                  </UFormField>

                  <UFormField
                    v-if="importState.cardSeparator === 'custom'"
                    name="customCardSeparator"
                  >
                    <UInput
                      v-model="importState.customCardSeparator"
                      class="mt-1"
                      placeholder="eg. \"
                    />
                  </UFormField>
                </div>
              </div>

              <h3 class="font-semibold sm:text-lg">
                Preview
                <span class="text-base font-normal"
                  >{{ parsedCards.length }} cards</span
                >
              </h3>

              <div class="flex flex-col gap-4">
                <UCard
                  v-for="(c, index) in parsedCards"
                  :key="index"
                  class="bg-elevated"
                  variant="subtle"
                >
                  <div class="flex flex-col sm:flex-row">
                    <UTextarea
                      v-model="c.term"
                      :rows="1"
                      :maxrows="10"
                      :ui="{
                        base: 'sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      class="w-full"
                      variant="ghost"
                      disabled
                      autoresize
                    />

                    <USeparator class="m-2 sm:hidden" />

                    <USeparator
                      orientation="vertical"
                      class="m-2 hidden h-auto sm:block"
                    />

                    <UTextarea
                      v-model="c.definition"
                      :rows="1"
                      :maxrows="10"
                      :ui="{
                        base: 'sm:text-lg font-medium disabled:opacity-100 disabled:cursor-default',
                      }"
                      class="w-full"
                      variant="ghost"
                      disabled
                      autoresize
                    />
                  </div>
                </UCard>
              </div>
            </UForm>
          </template>

          <template #footer>
            <div class="flex flex-1 place-content-end gap-2">
              <UButton
                class="cursor-pointer"
                label="Cancel"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                @click="isImportModalOpen = false"
              />

              <UButton
                class="cursor-pointer"
                label="Import"
                icon="i-lucide-copy-plus"
                variant="subtle"
                size="lg"
                type="submit"
                form="import-form"
              />
            </div>
          </template>
        </UModal>
      </div>

      <div class="flex flex-col gap-4">
        <UCard
          class="hover:border-primary/75 hover:text-primary/75 border-accented text-muted flex h-28 cursor-pointer place-content-center place-items-center border-2 border-dashed transition-all select-none active:scale-95"
          @click="createState.cards.unshift({ term: '', definition: '' })"
        >
          <div class="flex place-content-center place-items-center gap-2">
            <UIcon name="i-lucide-plus" class="size-8" />

            <span class="text-base font-semibold sm:text-lg">
              Add new card
            </span>
          </div>
        </UCard>

        <TransitionGroup name="list">
          <UCard
            v-for="(c, index) in createState.cards"
            :key="index"
            class="bg-elevated"
            variant="subtle"
          >
            <div
              class="mb-1 flex place-content-between place-items-center px-0"
            >
              <p class="text-base font-medium sm:text-lg">{{ index + 1 }}</p>

              <UButton
                class="cursor-pointer"
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                @click="createState.cards.splice(index, 1)"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                <UTextarea
                  v-model="c.term"
                  :rows="1"
                  :maxrows="10"
                  :ui="{ base: 'text-base sm:text-lg font-medium' }"
                  class="w-full"
                  placeholder="Enter your term..."
                  autoresize
                />
              </UFormField>

              <UFormField class="sm:flex-1" :name="`cards.${index}.definition`">
                <UTextarea
                  v-model="c.definition"
                  :rows="1"
                  :maxrows="10"
                  :ui="{ base: 'text-base sm:text-lg font-medium' }"
                  class="w-full"
                  placeholder="Enter your definition..."
                  autoresize
                />
              </UFormField>
            </div>
          </UCard>
        </TransitionGroup>

        <UCard
          class="hover:border-primary/75 hover:text-primary/75 border-accented text-muted flex h-28 cursor-pointer place-content-center place-items-center border-2 border-dashed transition-all select-none active:scale-95"
          @click="createState.cards.push({ term: '', definition: '' })"
        >
          <div class="flex place-content-center place-items-center gap-2">
            <UIcon name="i-lucide-plus" class="size-8" />

            <span class="text-base font-semibold sm:text-lg">
              Add new card
            </span>
          </div>
        </UCard>
      </div>
    </UForm>
  </UContainer>
</template>

<style scoped></style>
