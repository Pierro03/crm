import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { isMirrored } from "./images";
import { safeFetch } from "./safe-fetch";

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 15_000;

type ExtensionByMediaType = Record<string, string>;

const ALLOWED: ExtensionByMediaType = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
	"image/svg+xml": "svg",
	"image/x-icon": "ico",
	"image/vnd.microsoft.icon": "ico",
};

type StorageConfig = {
	region: string;
	bucket: string;
	prefix: string;
	baseUrl: string;
	signingSecret: string;
};

type StoredAsset = {
	bytes: Uint8Array;
	contentType: string;
	cacheControl: string;
};

let client: S3Client | null = null;

function storageConfig(): StorageConfig | null {
	const region = process.env.AWS_REGION?.trim();
	const bucket = process.env.AWS_S3_BUCKET?.trim();
	const baseUrl = process.env.S3_ASSET_BASE_URL?.trim().replace(/\/$/, "");
	const signingSecret = process.env.S3_ASSET_SIGNING_SECRET?.trim();
	if (!region || !bucket || !baseUrl || !signingSecret) return null;

	return {
		region,
		bucket,
		prefix:
			process.env.AWS_S3_PREFIX?.trim().replace(/^\/+|\/+$/g, "") ||
			"crm/assets",
		baseUrl,
		signingSecret,
	};
}

function s3(config: StorageConfig): S3Client {
	client ??= new S3Client({ region: config.region });
	return client;
}

function assetSignature(key: string, secret: string): string {
	return createHmac("sha256", secret).update(key).digest("base64url");
}

export function blobEnabled(): boolean {
	return storageConfig() !== null;
}

export function verifyAssetSignature(key: string, signature: string): boolean {
	const config = storageConfig();
	if (!config) return false;
	const expected = Buffer.from(assetSignature(key, config.signingSecret));
	const actual = Buffer.from(signature);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function mirror(
	sourceUrl: string,
	prefix: string,
): Promise<string | null> {
	const config = storageConfig();
	if (!config) return null;
	if (isMirrored(sourceUrl)) return sourceUrl;

	try {
		const result = await safeFetch(sourceUrl, { timeoutMs: TIMEOUT_MS });
		if (!result?.response.ok) return null;

		const { response } = result;
		const type = response.headers.get("content-type")?.split(";")[0]?.trim();
		const extension = type ? ALLOWED[type.toLowerCase()] : undefined;
		if (!type || !extension) return null;

		const bytes = await readCapped(response);
		if (!bytes) return null;

		const digest = createHash("sha256")
			.update(bytes)
			.digest("hex")
			.slice(0, 12);
		const filename = `${prefix}-${digest}.${extension}`;
		const key = `${config.prefix}/${filename}`;

		await s3(config).send(
			new PutObjectCommand({
				Bucket: config.bucket,
				Key: key,
				Body: bytes,
				ContentType: type,
				CacheControl: "public, max-age=31536000, immutable",
				ServerSideEncryption: "AES256",
			}),
		);

		const signature = assetSignature(key, config.signingSecret);
		return `${config.baseUrl}/${encodeURIComponent(filename)}?signature=${signature}`;
	} catch {
		return null;
	}
}

export async function readStoredAsset(
	filename: string,
): Promise<StoredAsset | null> {
	const config = storageConfig();
	if (!config || !/^[A-Za-z0-9._-]+$/.test(filename)) return null;
	const key = `${config.prefix}/${filename}`;
	const response = await s3(config).send(
		new GetObjectCommand({ Bucket: config.bucket, Key: key }),
	);
	if (!response.Body) return null;

	return {
		bytes: await response.Body.transformToByteArray(),
		contentType: response.ContentType ?? "application/octet-stream",
		cacheControl:
			response.CacheControl ?? "public, max-age=31536000, immutable",
	};
}

export function storedAssetKey(filename: string): string | null {
	const config = storageConfig();
	if (!config || !/^[A-Za-z0-9._-]+$/.test(filename)) return null;
	return `${config.prefix}/${filename}`;
}

async function readCapped(response: Response): Promise<Buffer | null> {
	const declared = Number(response.headers.get("content-length"));
	if (Number.isFinite(declared) && declared > MAX_BYTES) {
		await response.body?.cancel();
		return null;
	}

	if (!response.body) return null;

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;

	try {
		while (size <= MAX_BYTES) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			chunks.push(value);
		}
	} catch {
		return null;
	} finally {
		await reader.cancel().catch(() => {});
	}

	if (size === 0 || size > MAX_BYTES) return null;
	return Buffer.concat(chunks);
}
