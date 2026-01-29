import type { SelectMenuItem } from "@nuxt/ui";

export const visibilityItems = ref<(SelectMenuItem & { id: Visibility })[]>([
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

export const contentSeparatorItems = ref<
	(SelectMenuItem & { id: ContentSeparator })[]
>([
	{
		id: "tab",
		label: "Tab",
	},
	{
		id: "comma",
		label: "Comma",
	},
	{
		id: "custom",
		label: "Custom",
	},
]);

export const cardSeparatorItems = ref<
	(SelectMenuItem & { id: CardSeparator })[]
>([
	{
		id: "new_line",
		label: "New line",
	},
	{
		id: "semicolon",
		label: "Semicolon",
	},
	{
		id: "custom",
		label: "Custom",
	},
]);

export const termLanguageItems = ref<(SelectMenuItem & { id: LanguageCode })[]>(
	[
		{
			id: "en",
			label: "English",
		},
		{
			id: "vi",
			label: "Vietnamese",
		},
	],
);

export const definitionLanguageItems = ref<
	(SelectMenuItem & { id: LanguageCode })[]
>([
	{
		id: "en",
		label: "English",
	},
	{
		id: "vi",
		label: "Vietnamese",
	},
]);
