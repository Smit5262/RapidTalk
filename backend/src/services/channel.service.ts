import { ChannelType, WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { channelRepository } from "../repositories/channel.repository";
import { CreateChannelInput, UpdateChannelInput } from "../validators/channel.validator";

export const channelService = {
  create(workspaceId: string, creatorMemberId: string, input: CreateChannelInput) {
    return channelRepository.create({
      workspaceId,
      name: input.name,
      type: input.type,
      topic: input.topic,
      creatorMemberId,
    });
  },

  listForMember(workspaceId: string, workspaceMemberId: string) {
    return channelRepository.listForWorkspaceMember(workspaceId, workspaceMemberId);
  },

  async getOne(channelId: string, workspaceMemberId: string) {
    const channel = await channelRepository.findById(channelId);
    if (!channel || channel.isArchived) {
      throw new AppError("Channel not found", 404);
    }

    if (channel.type !== ChannelType.PUBLIC) {
      const membership = await channelRepository.findMembership(channelId, workspaceMemberId);
      if (!membership) {
        throw new AppError("You don't have access to this channel", 403);
      }
    }

    return channel;
  },

  async update(channelId: string, input: UpdateChannelInput) {
    const channel = await channelRepository.findById(channelId);
    if (!channel) {
      throw new AppError("Channel not found", 404);
    }
    return channelRepository.update(channelId, input);
  },

  async archive(channelId: string) {
    const channel = await channelRepository.findById(channelId);
    if (!channel) {
      throw new AppError("Channel not found", 404);
    }
    return channelRepository.archive(channelId);
  },

  async join(channelId: string, workspaceMemberId: string) {
    const channel = await channelRepository.findById(channelId);
    if (!channel || channel.isArchived) {
      throw new AppError("Channel not found", 404);
    }
    if (channel.type !== ChannelType.PUBLIC) {
      throw new AppError("Private channels require an invite", 403);
    }

    const existing = await channelRepository.findMembership(channelId, workspaceMemberId);
    if (existing) {
      throw new AppError("Already a member of this channel", 409);
    }

    return channelRepository.addMember(channelId, workspaceMemberId);
  },

  async leave(channelId: string, workspaceMemberId: string) {
    const membership = await channelRepository.findMembership(channelId, workspaceMemberId);
    if (!membership) {
      throw new AppError("You're not a member of this channel", 404);
    }
    await channelRepository.removeMember(channelId, workspaceMemberId);
  },

  async togglePin(channelId: string, workspaceMemberId: string) {
    const membership = await channelRepository.findMembership(channelId, workspaceMemberId);
    if (!membership) {
      throw new AppError("You're not a member of this channel", 404);
    }
    return channelRepository.setFlag(channelId, workspaceMemberId, "isPinned", !membership.isPinned);
  },

  async toggleFavorite(channelId: string, workspaceMemberId: string) {
    const membership = await channelRepository.findMembership(channelId, workspaceMemberId);
    if (!membership) {
      throw new AppError("You're not a member of this channel", 404);
    }
    return channelRepository.setFlag(channelId, workspaceMemberId, "isFavorite", !membership.isFavorite);
  },
};

export const CHANNEL_ADMIN_ROLES = [WorkspaceRole.OWNER, WorkspaceRole.ADMIN];