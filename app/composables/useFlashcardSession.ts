export const useFlashcardSession = () => {
  const { token } = useAuth();
  const {
    deck,
    cards,
    status,
    isFetching,
    isIgnoreDate,
    deckId,
    deckSlug,
    username,
    onRestart,
    onIgnoreDate,
    refresh,
  } = useDeckData();

  const isAnswersSaving = useState<boolean>('is-answers-saving', () => false);

  const session = reactive<StudySession>({
    currentQuestion: undefined,
    queue: [],
    answers: [],
    savedAnswers: [],
    retryQueue: [],
    totalQuestions: 0,
    knownCount: 0,
    skippedCount: 0,
  });

  const progress = computed(() => {
    if (!session.totalQuestions) return 0;
    return (session.knownCount / session.totalQuestions) * 100;
  });

  // Initialize Session
  watchImmediate(cards, (newCards) => {
    if (newCards && newCards.length > 0) {
      // Reset session
      session.knownCount = 0;
      session.skippedCount = 0;
      session.savedAnswers = [];

      session.answers = [];
      session.retryQueue = [];
      session.queue = structuredClone(newCards);
      session.totalQuestions = session.queue.length;

      session.currentQuestion = session.queue.shift();
    } else {
      session.currentQuestion = undefined;
    }
  });

  // Auto-save
  watchDebounced(
    () => session.answers,
    async () => await saveAnswers(),
    { debounce: 1000, deep: true },
  );

  function handleAnswer(isCorrect: boolean) {
    if (!session.currentQuestion) return;

    isAnswersSaving.value = true;

    const updated = updateCard(session.currentQuestion, isCorrect);

    if (isCorrect) {
      session.knownCount++;
    } else {
      session.skippedCount++;
      session.retryQueue.push(updated);
    }

    // Update answers queue for saving
    const index = session.answers.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      session.answers[index] = updated;
    } else {
      session.answers.push(updated);
    }

    // Pick next card
    if (!session.queue.length) {
      if (!session.retryQueue.length) {
        session.currentQuestion = undefined;
        return;
      }

      session.queue = session.retryQueue;
      session.retryQueue = [];
    }

    session.currentQuestion = session.queue.shift();
  }

  async function saveAnswers() {
    const answersToSave = [...session.answers];
    if (answersToSave.length === 0) return;

    const id = deckId.value;

    $fetch(`/api/study/save-answer/${id}`, {
      method: 'POST',
      headers: { Authorization: token.value || '' },
      body: { answers: answersToSave },
    })
      .then(() => {
        session.savedAnswers = answersToSave; // Notify watchers
        session.answers = [];
      })
      .catch((err: ErrorResponse) => {
        console.error('Save answers fail!', err.data);
      })
      .finally(() => (isAnswersSaving.value = false));
  }

  return {
    deck,
    session,
    status,
    isFetching,
    isIgnoreDate,
    isAnswersSaving,
    progress,
    deckId,
    deckSlug,
    username,
    onRestart,
    onIgnoreDate,
    handleAnswer,
    refresh,
  };
};
