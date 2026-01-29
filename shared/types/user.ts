import type { UserRole } from "~/utils/enums";
import type { UUID } from "./branded";

export type User = {
	id: UUID;
	username: string;
	email?: string | null;
	emailVerified: boolean;
	avatarUrl?: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt?: Date | null;
};

export type Owner = Pick<User, "id" | "username" | "avatarUrl">;

export type UserStats = {
	currentStreak: number;
	longestStreak: number;
	totalCardsLearned: number;
	masteryRate: number;
};
