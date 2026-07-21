import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("../../config/database", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("../../repositories/auth.repository", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
  sessionRepository: {
    create: vi.fn(),
    findByToken: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock("../../utils/jwt", () => ({
  signAccessToken: vi.fn(() => "mock-access-token"),
  getRefreshTokenExpiry: vi.fn(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
}));

import { authService } from "../../services/auth.service";
import { userRepository, sessionRepository } from "../../repositories/auth.repository";
import { AppError } from "../../utils/AppError";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should throw 409 if email already exists", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: "existing" } as any);

      await expect(
        authService.register({ email: "test@example.com", password: "password123", name: "Test" }),
      ).rejects.toThrow(AppError);
    });

    it("should create a new user and return session", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue({
        id: "new-user",
        name: "Test",
        email: "test@example.com",
        avatarUrl: null,
      } as any);
      vi.mocked(sessionRepository.create).mockResolvedValue({} as any);
      vi.mocked(userRepository.findById).mockResolvedValue({
        id: "new-user",
        name: "Test",
        email: "test@example.com",
        avatarUrl: null,
      } as any);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        name: "Test",
      });

      expect(result.accessToken).toBe("mock-access-token");
      expect(result.user.name).toBe("Test");
      expect(userRepository.create).toHaveBeenCalledOnce();
      expect(sessionRepository.create).toHaveBeenCalledOnce();
    });
  });

  describe("login", () => {
    it("should throw 401 for invalid email", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authService.login({ email: "wrong@example.com", password: "password" }, {}),
      ).rejects.toThrow(AppError);
    });
  });

  describe("refresh", () => {
    it("should throw 401 for invalid refresh token", async () => {
      vi.mocked(sessionRepository.findByToken).mockResolvedValue(null);

      await expect(authService.refresh("invalid-token")).rejects.toThrow(AppError);
    });

    it("should throw 401 for revoked token", async () => {
      vi.mocked(sessionRepository.findByToken).mockResolvedValue({
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
        userId: "user-1",
      } as any);

      await expect(authService.refresh("revoked-token")).rejects.toThrow(AppError);
    });
  });
});
