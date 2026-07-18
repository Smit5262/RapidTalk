import { ChannelType } from "@prisma/client";
import { prisma } from "../config/database";

export const channelRepository = {
  create(data: { workspaceId: string; name: string; type: ChannelType; topic?: string; creatorMemberId: string }) {
    return prisma.channel.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        type: data.type,
        topic: data.topic,
        members: {
          create: { workspaceMemberId: data.creatorMemberId },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.channel.findUnique({ where: { id } });
  },

  listForWorkspaceMember(workspaceId: string, workspaceMemberId: string) {
    return prisma.channel.findMany({
      where: {
        workspaceId,
        isArchived: false,
        OR: [{ type: "PUBLIC" }, { members: { some: { workspaceMemberId } } }],
      },
      include: {
        members: { where: { workspaceMemberId }, select: { isPinned: true, isFavorite: true, lastReadAt: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  update(id: string, data: { name?: string; topic?: string }) {
    return prisma.channel.update({ where: { id }, data });
  },

  archive(id: string) {
    return prisma.channel.update({ where: { id }, data: { isArchived: true } });
  },

  findMembership(channelId: string, workspaceMemberId: string) {
    return prisma.channelMember.findUnique({
      where: { channelId_workspaceMemberId: { channelId, workspaceMemberId } },
    });
  },

  addMember(channelId: string, workspaceMemberId: string) {
    return prisma.channelMember.create({ data: { channelId, workspaceMemberId } });
  },

  removeMember(channelId: string, workspaceMemberId: string) {
    return prisma.channelMember.delete({
      where: { channelId_workspaceMemberId: { channelId, workspaceMemberId } },
    });
  },

  setFlag(channelId: string, workspaceMemberId: string, field: "isPinned" | "isFavorite", value: boolean) {
    return prisma.channelMember.update({
      where: { channelId_workspaceMemberId: { channelId, workspaceMemberId } },
      data: { [field]: value },
    });
  },
};