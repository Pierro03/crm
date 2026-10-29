import {
	readStoredAsset,
	storedAssetKey,
	verifyAssetSignature,
} from "@crm/db/blob";
import {
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	Query,
	Res,
	StreamableFile,
} from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";

@ApiTags("Storage")
@Controller("api/assets")
export class StorageController {
	@Get(":filename")
	@AllowAnonymous()
	@ApiOkResponse({ description: "Return a signed CRM image asset." })
	@ApiNotFoundResponse({ description: "The asset does not exist." })
	async asset(
		@Param("filename") filename: string,
		@Query("signature") signature: string | undefined,
		@Res({ passthrough: true }) response: Response,
	) {
		const key = storedAssetKey(filename);
		if (!key) throw new NotFoundException("Asset not found");
		if (!signature || !verifyAssetSignature(key, signature)) {
			throw new ForbiddenException("Invalid asset signature");
		}

		try {
			const asset = await readStoredAsset(filename);
			if (!asset) throw new NotFoundException("Asset not found");
			response.setHeader("Content-Type", asset.contentType);
			response.setHeader("Cache-Control", asset.cacheControl);
			response.setHeader("X-Content-Type-Options", "nosniff");
			return new StreamableFile(asset.bytes);
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			throw new NotFoundException("Asset not found");
		}
	}
}
