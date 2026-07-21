import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../repositories/workspace.repository", () => ({
  workspaceRepository: {
    create: vi.fn(),
    findBySlug: vi.fn(),
    findById: vi.fn(),
    listForUser: vi.fn(),
    listMembers: vi.fn(),
    findMemberById: vi.fn(),
    updateMemberRole: vi.fn(),
    addMember: vi.fn(),
    findMember: vi.fn(),
  },
  workspaceInviteRepository: {
    create: vi.fn(),
    findByToken: vi.fn(),
    markAccepted: vi.fn(),
  },
}));

vi.mock("../../repositories/auth.repository", () => ({
  userRepository: { findByEmail: vi.fn(), findById: vi.fn() },
}));

vi.mock("../../services/notification.service", () => ({
  notificationService: { create: vi.fn() },
}));

vi.mock("../../socket/emitter", () => ({
  emitToUser: vi.fn(),
}));

vi.mock("../../utils/slug", () => ({
  slugify: (s: string) => s.toLowerCase().replace(/\s+/g, "-"),
  randomSuffix: () => "abc123",
}));

import { workspaceService } from "../../services/workspace.service";
import { workspaceRepository, workspaceInviteRepository } from "../../repositories/workspace.repository";
import { AppError } from "../../utils/AppError";

describe("workspaceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a workspace with unique slug", async () => {
      vi.mocked(workspaceRepository.findBySlug).mockResolvedValueOnce(null);
      vi.mocked(workspaceRepository.create).mockResolvedValue({
        id: "ws-1",
        name: "Test Workspace",
        slug: "test-workspace",
      } as any);

      const result = await workspaceService.create("user-1", { name: "Test Workspace" });
      expect(result.slug).toBe("test-workspace");
      expect(workspaceRepository.create).toHaveBeenCalledOnce();
    });

    it("should retry slug on collision", async () => {
      vi.mocked(workspaceRepository.findBySlug)
        .mockResolvedValueOnce({ id: "existing" } as any)
        .mockResolvedValueOnce(null);
      vi.mocked(workspaceRepository.create).mockResolvedValue({
        id: "ws-2",
        name: "Test Workspace",
        slug: "test-workspace-abc123",
      } as any);

      const result = await workspaceService.create("user-1", { name: "Test Workspace" });
      expect(result.slug).toContain("test-workspace-");
    });
  });

  describe("getById", () => {
    it("should throw 404 for non-existent workspace", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(null);
      await expect(workspaceService.getById("nonexistent")).rejects.toThrow(AppError);
    });
  });

  describe("updateMemberRole", () => {
    it("should throw 404 for non-existent member", async () => {
      vi.mocked(workspaceRepository.findMemberById).mockResolvedValue(null);
      await expect(
        workspaceService.updateMemberRole("ws-1", "nonexistent", "MEMBER", "ADMIN"),
      ).rejects.toThrow(AppError);
    });

    it("should prevent non-owner from changing owner role", async () => {
      vi.mocked(workspaceRepository.findMemberById).mockResolvedValue({
        id: "member-1",
        role: "OWNER",
      } as any);

      await expect(
        workspaceService.updateMemberRole("ws-1", "member-1", "MEMBER", "ADMIN"),
      ).rejects.toThrow(AppError);
    });
  });

  describe("acceptInvite", () => {
    it("should throw 400 for expired invite", async () => {
      vi.mocked(workspaceInviteRepository.findByToken).mockResolvedValue({
        id: "invite-1",
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 100000),
      } as any);

      await expect(workspaceService.acceptInvite("token", "user-1")).rejects.toThrow(AppError);
    });

    it("should throw 409 for already-member", async () => {
      vi.mocked(workspaceInviteRepository.findByToken).mockResolvedValue({
        id: "invite-1",
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 100000),
        workspaceId: "ws-1",
      } as any);
      vi.mocked(workspaceRepository.findMember).mockResolvedValue({ id: "existing" } as any);

      await expect(workspaceService.acceptInvite("token", "user-1")).rejects.toThrow(AppError);
    });
  });
});
