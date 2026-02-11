import { AUTH_PROVIDERS, DEFAULT_FIELDS } from "./constants";
import type { AuthField, ProviderId } from "./types";

export const pickFields = (fields: AuthField[]) => {
	return DEFAULT_FIELDS.filter((field) =>
		fields.includes(field.name as AuthField),
	);
};

export const applyProviderHandlers = (
	handlers: Partial<Record<ProviderId, () => void>>,
) => {
	return AUTH_PROVIDERS.map((provider) => ({
		...provider,
		onClick: handlers[provider.id],
	}));
};
