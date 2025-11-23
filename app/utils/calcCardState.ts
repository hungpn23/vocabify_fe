import { addDays, isAfter } from 'date-fns';

type Options = {
  streak: number;
  correct: boolean;
  reviewDate?: string;
};

export type CalcResult = {
  streak: number;
  reviewDate: string;
};

export default (opts: Options): CalcResult => {
  const { streak, correct, reviewDate } = opts;
  const now = new Date();

  if (!correct) {
    return {
      streak: 0,
      reviewDate: now.toISOString(),
    };
  }

  const newStreak = streak + 1;

  const gap = Math.pow(2, newStreak - 1);

  const baseDate = reviewDate ? new Date(reviewDate) : now;
  const nextDate = addDays(baseDate, gap);

  const maxDate = addDays(now, 30);

  const finalDate = isAfter(nextDate, maxDate) ? maxDate : nextDate;

  return {
    streak: newStreak,
    reviewDate: finalDate.toISOString(),
  };
};
