import type { BetterAuthPlugin } from "better-auth";

export type StagingLoginOptions = {
	appUrl: string;
	secret?: string;
};

export function stagingLoginPlugins(
	_options: StagingLoginOptions,
): BetterAuthPlugin[] {
	return [];
}
