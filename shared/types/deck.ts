import type { Visibility } from '~/utils/enums';
import type { UUID } from './branded';
import type { Owner } from './user';
import { cardSchema, type Card, type PreviewCard } from './card';
import * as v from 'valibot';

export const updateDeckSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  description: v.string(),
  cards: v.pipe(
    v.array(cardSchema),
    v.minLength(4, 'At least 4 cards are required'),
  ),
});

export type UpdateDeck = v.InferOutput<typeof updateDeckSchema>;

export type Deck = {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
  visibility: Visibility;
  learnerCount: number;
  clonedFrom?: Pick<Deck, 'id' | 'name'> | null;
  openedAt?: string | null;
  createdAt: string;
};

export type DeckStats = {
  total: number;
  known: number;
  learning: number;
  new: number;
};

export type GetOneRes = Pick<Deck, 'id' | 'name' | 'slug' | 'description'> & {
  cards: Card[];
};

export type GetManyRes = Pick<
  Deck,
  'id' | 'name' | 'slug' | 'visibility' | 'openedAt'
> & {
  stats: DeckStats;
};

// --- SHARED ---
export type GetSharedOneRes = Pick<Deck, 'id' | 'name' | 'description'> & {
  totalCards: number;
  owner: Owner;
  cards: PreviewCard[];
};

export type GetSharedManyRes = Pick<
  Deck,
  'id' | 'name' | 'slug' | 'visibility' | 'learnerCount' | 'createdAt'
> & {
  totalCards: number;
  owner: Owner;
};

// --- SEARCH ---
export type DeckOrderBy = 'createdAt' | 'openedAt' | 'name';

export type DeckUrlParams = {
  page: string;
  limit: string;
  search: string;
  filter: string;
};

// --- CREATE ---
export type ContentSeparator = 'tab' | 'comma' | 'custom';

export type CardSeparator = 'new_line' | 'semicolon' | 'custom';

export type CreateDeckRes = Pick<Deck, 'id' | 'slug'>;
