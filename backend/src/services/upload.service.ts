import { randomBytes } from "crypto";
import { getPresignedUploadUrl, getPublicFileUrl } from "../config/s3";
import { PresignUploadInput } from "../validators/upload.validator";

export const uploadService = {
  async presign(channelId: string, input: PresignUploadInput) {
    const ext = input.fileName.split(".").pop() ?? "bin";
    const key = `channels/${channelId}/${randomBytes(16).toString("hex")}.${ext}`;

    const url = await getPresignedUploadUrl(key, input.mimeType, input.sizeBytes);
    const fileUrl = getPublicFileUrl(key);

    return { url, fileUrl, key };
  },
};
