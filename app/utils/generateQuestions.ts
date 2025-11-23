export default (
  cards: Card[],
  types: QuestionType[],
  dir: QuestionDirection,
): Question[] => {
  const questions: Question[] = [];

  for (const { id, ...c } of cards) {
    const random = Math.random();
    const type = types[Math.floor(random * types.length)]!;

    let direction: QuestionDirection;
    if (dir === 'both') {
      direction = random < 0.5 ? 'term_to_def' : 'def_to_term';
    } else {
      direction = dir;
    }

    const isTermToDef = direction === 'term_to_def';

    let question: string;
    let answer: string;
    if (isTermToDef) {
      question = c.term;
      answer = c.definition;
    } else {
      question = c.definition;
      answer = c.term;
    }

    let choices: string[] | undefined;
    if (type === 'multiple_choices') {
      const result = [answer];

      const others = cards.filter((card) => card !== c);
      const shuffledOthers = shuffle(others);

      for (let i = 0; i < 3; i++) {
        const distractor = shuffledOthers[i]!;

        const distractorAnswer = isTermToDef
          ? distractor.definition
          : distractor.term;

        result.push(distractorAnswer);
      }

      choices = shuffle(result);
    }

    questions.push({ id, type, direction, question, answer, choices });
  }

  return questions;
};
