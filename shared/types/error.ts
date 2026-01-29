import type { FetchError } from "ofetch";

export type ErrorDetail = {
	property: string;
	constraintName: string;
	message: string;
};

export type ErrorResponse = FetchError<{
	timestamp: string;
	statusCode: number;
	statusMessage?: string;
	message: string;
	details?: ErrorDetail[];
}>;
