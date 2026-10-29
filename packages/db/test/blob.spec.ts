import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { blobEnabled, storedAssetKey } from "../src/blob";

const KEYS = [
	"AWS_REGION",
	"AWS_S3_BUCKET",
	"AWS_S3_PREFIX",
	"S3_ASSET_BASE_URL",
	"S3_ASSET_SIGNING_SECRET",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
	for (const key of KEYS) {
		saved[key] = process.env[key];
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of KEYS) {
		if (saved[key] === undefined) delete process.env[key];
		else process.env[key] = saved[key];
	}
});

describe("S3 asset storage", () => {
	it("stays disabled until every required setting exists", () => {
		process.env.AWS_REGION = "us-east-1";
		process.env.AWS_S3_BUCKET = "bucket";
		process.env.S3_ASSET_BASE_URL = "https://api.example.com/api/assets";
		expect(blobEnabled()).toBe(false);

		process.env.S3_ASSET_SIGNING_SECRET = "x".repeat(32);
		expect(blobEnabled()).toBe(true);
	});

	it("keeps asset keys inside the configured prefix", () => {
		process.env.AWS_REGION = "us-east-1";
		process.env.AWS_S3_BUCKET = "bucket";
		process.env.AWS_S3_PREFIX = "/crm/assets/";
		process.env.S3_ASSET_BASE_URL = "https://api.example.com/api/assets/";
		process.env.S3_ASSET_SIGNING_SECRET = "x".repeat(32);

		expect(storedAssetKey("logo-ab12.png")).toBe("crm/assets/logo-ab12.png");
		expect(storedAssetKey("../report.pdf")).toBeNull();
	});
});
