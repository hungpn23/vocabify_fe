export const useDeckData = () => {
  const { token } = useAuth();
  const route = useRoute();
  const toast = useToast();

  const deckId = computed(() => route.query.deckId as string);

  const deckSlug = computed(() => {
    const slug = route.params.slug;
    return Array.isArray(slug) ? slug[0] : slug;
  });

  const username = computed(() => {
    const n = route.params.username;
    return Array.isArray(n) ? n[0] : n;
  });

  const isIgnoreDate = useState<boolean>('is-ignore-date', () => false);

  const {
    data: deck,
    status,
    refresh,
    error,
  } = useLazyFetch<DeckWithCards>(() => `/api/decks/${deckId.value}`, {
    key: `deck-${deckId.value}`,
    headers: { Authorization: token.value || '' },
    server: false,
    watch: [deckId],
  });

  const cards = computed(() => {
    return getCards(deck.value?.cards || [], isIgnoreDate.value);
  });

  const isFetching = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );

  // --- Watchers ---
  watch(deckId, (newId, oldId) => {
    if (newId !== oldId) {
      isIgnoreDate.value = false;
    }
  });

  watch(status, (newStatus) => {
    if (newStatus === 'error') {
      toast.add({
        title: 'Error fetching decks',
        description: JSON.stringify(error.value?.data || 'Unknown error'),
        color: 'error',
      });
    }
  });

  // --- Actions ---
  async function onIgnoreDate() {
    isIgnoreDate.value = true;
    await refresh();
  }

  async function onRestart() {
    const id = deckId.value;
    if (!id) return;

    $fetch(`/api/decks/restart/${id}`, {
      method: 'POST',
      headers: {
        Authorization: token.value || '',
      },
    })
      .then(async () => {
        isIgnoreDate.value = false;
        await refresh();
      })
      .catch((err: ErrorResponse) => {
        toast.add({
          title: 'Error restarting deck',
          description: JSON.stringify(err.data || 'Unknown error'),
          color: 'error',
        });
      });
  }

  return {
    deck,
    cards,
    status,
    error,
    isFetching,
    isIgnoreDate,
    deckId,
    deckSlug,
    username,
    refresh,
    onIgnoreDate,
    onRestart,
  };
};
