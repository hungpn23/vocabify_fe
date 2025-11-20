import { CardStatus } from '~/utils/enums';
import type { UUID } from './branded';
import * as v from 'valibot';

export const CardSchema = v.object({
  id: v.pipe(
    v.string(),
    v.transform((val) => val as UUID),
  ),
  term: v.pipe(v.string(), v.minLength(1, 'Term is required')),
  definition: v.pipe(v.string(), v.minLength(1, 'Definition is required')),
  correctCount: v.pipe(
    v.number(),
    v.minValue(0, 'Correct count cannot be negative'),
  ),
  nextReviewDate: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, 'Next review date is required'),
      v.transform((val) => new Date(val).toISOString()),
    ),
  ),
  status: v.enum(CardStatus),
});

export type Card = v.InferOutput<typeof CardSchema>;

export type CardAnswer = Pick<Card, 'id' | 'correctCount' | 'nextReviewDate'>;

export type CalcResult = Required<
  Pick<Card, 'correctCount' | 'nextReviewDate'>
>;
