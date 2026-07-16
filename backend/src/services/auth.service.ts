import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { AppError } from "../utils/AppError";
import { getRefreshTokenExpiry, signAccessToken } from "../utils/jwt";
import { sessionRepository, userRepository } from "../repositories/auth.repository";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

function toSafeUser(user: { id: string; name: string; email: string; avatarUrl: string | null }) {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return this.issueSession(user.id, user.email);
  },

  async login(input: LoginInput, context: { userAgent?: string; ipAddress?: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    return this.issueSession(user.id, user.email, context);
  },

  async issueSession(
    userId: string,
    email: string,
    context: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const accessToken = signAccessToken({ sub: userId, email });
    const refreshToken = randomBytes(48).toString("hex");

    await sessionRepository.create({
      userId,
      refreshToken,
      expiresAt: getRefreshTokenExpiry(),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    const user = await userRepository.findById(userId);
    return { accessToken, refreshToken, user: toSafeUser(user!) };
  },

  async refresh(refreshToken: string) {
    const session = await sessionRepository.findByToken(refreshToken);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    await sessionRepository.revoke(refreshToken);

    const user = await userRepository.findById(session.userId);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    return this.issueSession(user.id, user.email);
  },

  async logout(refreshToken: string) {
    const session = await sessionRepository.findByToken(refreshToken);
    if (session && !session.revokedAt) {
      await sessionRepository.revoke(refreshToken);
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return toSafeUser(user);
  },
};