<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui';
import {
  createDeckSchema,
  importCardsSchema,
  type CreateDeckSchema,
  type ImportCardsSchema,
} from './schemas';

import {
  visibilityItems,
  contentSeparatorItems,
  cardSeparatorItems,
  termLanguageCodeItems,
  definitionLanguageCodeItems,
} from './select-items';

const router = useRouter();
const toast = useToast();
const { token } = useAuth();

const passcodeInput = useTemplateRef('passcodeInput');

const isVisibilityModalOpen = ref(false);
const isImportModalOpen = ref(false);
const isSubmitting = ref(false);
const formErrorMsg = ref('');
const termLanguageCode = ref<LanguageCode>('en');
const definitionLanguageCode = ref<LanguageCode>('en');

const createState = reactive<CreateDeckSchema>({
  name: '',
  description: '',
  visibility: Visibility.PUBLIC,
  cards: [
    {
      term: '',
      definition: '',
      termLanguage: 'en',
      definitionLanguage: 'en',
    },
    {
      term: '',
      definition: '',
      termLanguage: 'en',
      definitionLanguage: 'en',
    },
    {
      term: '',
      definition: '',
      termLanguage: 'en',
      definitionLanguage: 'en',
    },
    {
      term: '',
      definition: '',
      termLanguage: 'en',
      definitionLanguage: 'en',
    },
  ],
});

const importState = reactive({
  input: '',
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

  if (!importState.input || !sep || !cardSep) return [];

  const cards = importState.input
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

async function onCreate(event: FormSubmitEvent<CreateDeckSchema>) {
  formErrorMsg.value = '';
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  $fetch<CreateDeckRes>('/api/decks', {
    method: 'POST',
    headers: { Authorization: token.value || '' },
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
      console.log(`🚀 ~ onCreate ~ error.data:`, error.data);
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

async function onImportSubmit(event: FormSubmitEvent<ImportCardsSchema>) {
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

  const importCards = event.data.input
    .split(cardSep)
    .filter((card) => card.trim().length > 0)
    .map((card) => {
      const [term = '', definition = ''] = card.split(sep);

      return {
        term,
        definition,
        termLanguage: 'en' as LanguageCode,
        definitionLanguage: 'en' as LanguageCode,
      };
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
  const cardError = event.errors.find((e) => e.name === 'input');

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

    <!-- Create Deck Form -->
    <UForm
      id="create-deck-form"
      :schema="createDeckSchema"
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
            <!-- Import Cards Form -->
            <UForm
              id="import-form"
              :schema="importCardsSchema"
              :state="importState"
              class="flex flex-col gap-4"
              @submit="onImportSubmit"
            >
              <UFormField name="input">
                <UTextarea
                  v-model="importState.input"
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
        <TransitionGroup name="list">
          <UCard
            v-for="(c, index) in createState.cards"
            :key="index"
            class="bg-elevated"
            variant="subtle"
          >
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="flex h-fit flex-col gap-2">
                <div class="flex place-content-between place-items-center">
                  <span class="text-base font-medium sm:text-lg">
                    {{ index + 1 }}
                  </span>

                  <USelectMenu
                    v-model="termLanguageCode"
                    :items="termLanguageCodeItems"
                    value-key="id"
                  />
                </div>

                <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                  <UTextarea
                    v-model="c.term"
                    :rows="1"
                    :maxrows="10"
                    :ui="{ base: 'text-base font-medium' }"
                    class="w-full"
                    placeholder="Enter your term..."
                    autoresize
                  />
                </UFormField>

                <!-- <div class="grid grid-cols-2 gap-1">
                  <UInput
                    :ui="{ base: 'text-base' }"
                    placeholder="part of speech..."
                  />
                  <UInput
                    :ui="{ base: 'text-base' }"
                    placeholder="pronunciation..."
                  />
                </div> -->
              </div>

              <USeparator class="sm:hidden" />

              <div class="flex h-fit flex-col gap-2">
                <USelectMenu
                  class="place-self-end"
                  v-model="definitionLanguageCode"
                  :items="definitionLanguageCodeItems"
                  value-key="id"
                />

                <UFormField
                  class="sm:flex-1"
                  :name="`cards.${index}.definition`"
                >
                  <UTextarea
                    v-model="c.definition"
                    :rows="1"
                    :maxrows="10"
                    :ui="{ base: 'text-base font-medium' }"
                    class="w-full"
                    placeholder="Enter your definition..."
                    autoresize
                  />
                </UFormField>

                <!-- <UInput
                  :ui="{ base: 'text-base' }"
                  placeholder="example sentence 1..."
                /> -->
              </div>
            </div>

            <UButton
              class="mt-2 flex place-self-end"
              label="Remove"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="createState.cards.splice(index, 1)"
            />
          </UCard>
        </TransitionGroup>

        <UCard
          class="hover:border-primary/75 hover:text-primary/75 border-accented text-muted flex h-28 cursor-pointer place-content-center place-items-center border-2 border-dashed ring-0 transition-all select-none active:scale-95"
          @click="
            createState.cards.push({
              term: '',
              definition: '',
              termLanguage: 'en',
              definitionLanguage: 'en',
              pronunciation: '',
              partOfSpeech: '',
              usageOrGrammar: '',
              example: '',
            })
          "
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
