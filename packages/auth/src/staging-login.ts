import { createHash, timingSafeEqual } from "node:crypto";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

const STAGING_LOGIN_PATH = "/staging-login";
const STAGING_LOGIN_REALM = "CRM staging";

export type StagingLoginOptions = {
	appUrl: string;
	secret?: string;
};

type BasicCredentials = {
	email: string;
	password: string;
};

function unauthorized(): Response {
	return new Response("Authentication required.", {
		status: 401,
		headers: {
			"cache-control": "no-store",
			"www-authenticate": `Basic realm="${STAGING_LOGIN_REALM}", charset="UTF-8"`,
		},
	});
}

function submitLogin(): Response {
	return new Response(
		'<form method="post"></form><script>document.forms[0].submit()</script>',
		{
			headers: {
				"cache-control": "no-store",
				"content-type": "text/html; charset=utf-8",
			},
		},
	);
}

export function parseBasicCredentials(
	authorization: string | null,
): BasicCredentials | undefined {
	if (!authorization?.startsWith("Basic ")) return undefined;

	try {
		const decoded = Buffer.from(authorization.slice(6), "base64").toString(
			"utf8",
		);
		const separator = decoded.indexOf(":");
		if (separator < 1) return undefined;

		const email = decoded.slice(0, separator).trim().toLowerCase();
		const password = decoded.slice(separator + 1);
		if (!email || !password) return undefined;

		return { email, password };
	} catch {
		return undefined;
	}
}

export function secretsMatch(actual: string, expected: string): boolean {
	const actualHash = createHash("sha256").update(actual).digest();
	const expectedHash = createHash("sha256").update(expected).digest();
	return timingSafeEqual(actualHash, expectedHash);
}

export function stagingLoginPlugins({
	appUrl,
	secret,
}: StagingLoginOptions): BetterAuthPlugin[] {
	if (!secret) return [];

	return [
		{
			id: "staging-login",
			endpoints: {
				stagingLogin: createAuthEndpoint(
					STAGING_LOGIN_PATH,
					{ method: ["GET", "POST"] },
					async (ctx) => {
						const credentials = parseBasicCredentials(
							ctx.headers?.get("authorization") ?? null,
						);
						if (!credentials || !secretsMatch(credentials.password, secret)) {
							return unauthorized();
						}
						if (ctx.request?.method === "GET") return submitLogin();

						const existing = await ctx.context.internalAdapter.findUserByEmail(
							credentials.email,
						);
						const user =
							existing?.user ??
							(await ctx.context.internalAdapter.createUser({
								email: credentials.email,
								emailVerified: true,
								name: credentials.email.split("@")[0] ?? "Staging user",
							}));

						if (!user) {
							throw new APIError("INTERNAL_SERVER_ERROR", {
								message: "Could not create the staging user.",
							});
						}

						const session = await ctx.context.internalAdapter.createSession(
							user.id,
						);
						if (!session) {
							throw new APIError("INTERNAL_SERVER_ERROR", {
								message: "Could not create the staging session.",
							});
						}

						await setSessionCookie(ctx, { session, user });
						throw ctx.redirect(appUrl);
					},
				),
			},
		},
	];
}
