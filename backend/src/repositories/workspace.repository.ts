import { WorkspaceRole } from "@prisma/client";
import { prisma } from "../config/database";

export const workspaceRepository = {
  create(data: { name: string; slug: string; ownerId: string }) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        members: {
          create: { userId: data.ownerId, role: WorkspaceRole.OWNER },
        },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.workspace.findUnique({ where: { slug } });
  },

  findById(id: string) {
    return prisma.workspace.findUnique({ where: { id } });
  },

  update(id: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.workspace.update({ where: { id }, data });
  },

  listForUser(userId: string) {
    return prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: "asc" },
    });
  },

  listMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, status: true } } },
      orderBy: { joinedAt: "asc" },
    });
  },

  findMemberById(workspaceId: string, memberId: string) {
    return prisma.workspaceMember.findFirst({ where: { id: memberId, workspaceId } });
  },

  updateMemberRole(memberId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({ where: { id: memberId }, data: { role } });
  },

  addMember(workspaceId: string, userId: string, role: WorkspaceRole = WorkspaceRole.MEMBER) {
    return prisma.workspaceMember.create({ data: { workspaceId, userId, role } });
  },

  findMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  },
};

export const workspaceInviteRepository = {
  create(data: { workspaceId: string; token: string; email?: string; role: WorkspaceRole; expiresAt: Date }) {
    return prisma.workspaceInvite.create({ data });
  },

  findByToken(token: string) {
    return prisma.workspaceInvite.findUnique({ where: { token } });
  },

  markAccepted(id: string) {
    return prisma.workspaceInvite.update({ where: { id }, data: { acceptedAt: new Date() } });
  },
};