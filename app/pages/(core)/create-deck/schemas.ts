import * as v from "valibot";

export const createCardSchema = v.object({
	term: v.pipe(v.string(), v.nonEmpty("Term is required")),
	termLanguage: v.picklist(LANGUAGE_CODES),
	definition: v.pipe(v.string(), v.nonEmpty("Definition is required")),
	definitionLanguage: v.picklist(LANGUAGE_CODES),
	pronunciation: v.optional(v.string()),
	partOfSpeech: v.optional(v.string()),
	usageOrGrammar: v.optional(v.string()),
	examples: v.array(v.pipe(v.string(), v.nonEmpty("Example cannot be empty"))),
});

export const createDeckSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty("Name is required")),
	description: v.string(),
	visibility: v.enum(Visibility),
	passcode: v.optional(
		v.pipe(
			v.string(),
			v.minLength(4, "Passcode must be at least 4 characters"),
			v.maxLength(20, "Passcode must be at most 20 characters"),
		),
	),
	cards: v.pipe(
		v.array(createCardSchema),
		v.minLength(4, "At least 4 cards are required"),
	),
});

export const importCardsSchema = v.object({
	input: v.pipe(v.string(), v.nonEmpty("Input is required")),
});

export type CreateCardSchema = v.InferOutput<typeof createCardSchema>;
export type CreateDeckSchema = v.InferOutput<typeof createDeckSchema>;
export type ImportCardsSchema = v.InferOutput<typeof importCardsSchema>;
