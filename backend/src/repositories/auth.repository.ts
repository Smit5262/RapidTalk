import { prisma } from "../config/database";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },
};

export const sessionRepository = {
  create(data: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.session.create({ data });
  },

  findByToken(refreshToken: string) {
    return prisma.session.findUnique({ where: { refreshToken } });
  },

  revoke(refreshToken: string) {
    return prisma.session.update({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    });
  },
};