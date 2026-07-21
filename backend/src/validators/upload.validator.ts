import { z } from "zod";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const presignUploadSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
    channelId: z.string().uuid(),
  }),
  body: z.object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().refine((t) => ALLOWED_MIME_TYPES.includes(t), {
      message: "File type not allowed",
    }),
    sizeBytes: z
      .number()
      .int()
      .min(1)
      .max(25 * 1024 * 1024, "File size must be under 25MB"),
  }),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>["body"];
