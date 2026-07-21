import { prisma } from "../config/database";

export const uploadRepository = {
  createAttachment(data: {
    messageId: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    return prisma.attachment.create({ data });
  },

  createAttachments(
    attachments: Array<{
      messageId: string;
      fileUrl: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    }>,
  ) {
    return prisma.attachment.createMany({ data: attachments });
  },

  listByMessage(messageId: string) {
    return prisma.attachment.findMany({
      where: { messageId },
      orderBy: { createdAt: "asc" },
    });
  },
};
