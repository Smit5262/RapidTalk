import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repositories/message.repository", () => ({
  messageRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    listByChannel: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findReaction: vi.fn(),
    addReaction: vi.fn(),
    removeReaction: vi.fn(),
  },
}));

vi.mock("../../repositories/auth.repository", () => ({
  userRepository: { findByEmail: vi.fn(), findById: vi.fn() },
}));

vi.mock("../../repositories/workspace.repository", () => ({
  workspaceRepository: { findById: vi.fn() },
}));

vi.mock("../../services/notification.service", () => ({
  notificationService: { create: vi.fn() },
}));

vi.mock("../../socket/emitter", () => ({
  emitToUser: vi.fn(),
}));

import { messageService } from "../../services/message.service";
import { messageRepository } from "../../repositories/message.repository";
import { AppError } from "../../utils/AppError";

describe("messageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("edit", () => {
    it("should throw 404 for non-existent message", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(null);
      await expect(
        messageService.edit("msg-1", "user-1", { content: "new" }),
      ).rejects.toThrow(AppError);
    });

    it("should throw 403 when editing another user's message", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({
        authorId: "other-user",
        isDeleted: false,
      } as any);

      await expect(
        messageService.edit("msg-1", "user-1", { content: "new" }),
      ).rejects.toThrow(AppError);
    });

    it("should update own message", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({
        authorId: "user-1",
        isDeleted: false,
      } as any);
      vi.mocked(messageRepository.update).mockResolvedValue({} as any);

      await messageService.edit("msg-1", "user-1", { content: "updated" });
      expect(messageRepository.update).toHaveBeenCalledWith("msg-1", "updated");
    });
  });

  describe("remove", () => {
    it("should throw 403 when deleting another user's message", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({
        authorId: "other-user",
        isDeleted: false,
      } as any);

      await expect(messageService.remove("msg-1", "user-1")).rejects.toThrow(AppError);
    });

    it("should soft delete own message", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({
        authorId: "user-1",
        isDeleted: false,
      } as any);
      vi.mocked(messageRepository.softDelete).mockResolvedValue({} as any);

      await messageService.remove("msg-1", "user-1");
      expect(messageRepository.softDelete).toHaveBeenCalledWith("msg-1");
    });
  });

  describe("toggleReaction", () => {
    it("should add reaction if not exists", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({ isDeleted: false } as any);
      vi.mocked(messageRepository.findReaction).mockResolvedValue(null);
      vi.mocked(messageRepository.addReaction).mockResolvedValue({} as any);

      const result = await messageService.toggleReaction("msg-1", "user-1", "👍");
      expect(result.added).toBe(true);
    });

    it("should remove reaction if exists", async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue({ isDeleted: false } as any);
      vi.mocked(messageRepository.findReaction).mockResolvedValue({ id: "r-1" } as any);
      vi.mocked(messageRepository.removeReaction).mockResolvedValue({} as any);

      const result = await messageService.toggleReaction("msg-1", "user-1", "👍");
      expect(result.added).toBe(false);
    });
  });
});
