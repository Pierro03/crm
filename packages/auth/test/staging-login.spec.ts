import { describe, expect, test } from "bun:test";
import { parseBasicCredentials, secretsMatch } from "../src/staging-login";

describe("staging login", () => {
	test("parses an email and password from Basic authentication", () => {
		const value = Buffer.from("Caleb@Example.com:correct horse").toString(
			"base64",
		);

		expect(parseBasicCredentials(`Basic ${value}`)).toEqual({
			email: "caleb@example.com",
			password: "correct horse",
		});
	});

	test("rejects missing and malformed credentials", () => {
		expect(parseBasicCredentials(null)).toBeUndefined();
		expect(parseBasicCredentials("Bearer token")).toBeUndefined();
		expect(
			parseBasicCredentials(
				`Basic ${Buffer.from("missing-password").toString("base64")}`,
			),
		).toBeUndefined();
	});

	test("compares secrets without comparing their lengths", () => {
		expect(secretsMatch("same-secret", "same-secret")).toBe(true);
		expect(secretsMatch("short", "a-much-longer-secret")).toBe(false);
	});
});
