import { randomBytes } from "crypto";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { auditLog } from "../utils/audit";
import { randomSuffix, slugify } from "../utils/slug";
import {
  workspaceInviteRepository,
  workspaceRepository,
} from "../repositories/workspace.repository";
import { userRepository } from "../repositories/auth.repository";
import { notificationService } from "./notification.service";
import { emitToUser } from "../socket/emitter";
import { CreateInviteInput, CreateWorkspaceInput, UpdateWorkspaceInput } from "../validators/workspace.validator";

export const workspaceService = {
  async create(userId: string, input: CreateWorkspaceInput) {
    const baseSlug = slugify(input.name) || "workspace";
    let slug = baseSlug;

    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await workspaceRepository.findBySlug(slug);
      if (!existing) break;
      slug = `${baseSlug}-${randomSuffix()}`;
    }

    const workspace = await workspaceRepository.create({ name: input.name, slug, ownerId: userId });
    auditLog({ workspaceId: workspace.id, userId, action: "workspace_created", metadata: { name: input.name } });
    return workspace;
  },

  listMine(userId: string) {
    return workspaceRepository.listForUser(userId);
  },

  async getById(workspaceId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }
    return workspace;
  },

  async update(workspaceId: string, input: UpdateWorkspaceInput) {
    await this.getById(workspaceId);
    return workspaceRepository.update(workspaceId, input);
  },

  listMembers(workspaceId: string) {
    return workspaceRepository.listMembers(workspaceId);
  },

  async updateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole, actingRole: WorkspaceRole) {
    const member = await workspaceRepository.findMemberById(workspaceId, memberId);
    if (!member) {
      throw new AppError("Member not found in this workspace", 404);
    }

    if ((role === WorkspaceRole.OWNER || member.role === WorkspaceRole.OWNER) && actingRole !== WorkspaceRole.OWNER) {
      throw new AppError("Only the workspace owner can manage ownership", 403);
    }

    const updated = await workspaceRepository.updateMemberRole(memberId, role);
    auditLog({ workspaceId, action: "member_role_changed", metadata: { memberId, newRole: role } });
    return updated;
  },

  async createInvite(workspaceId: string, input: CreateInviteInput, invitedByName: string) {
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);

    const invite = await workspaceInviteRepository.create({
      workspaceId,
      token,
      email: input.email,
      role: input.role,
      expiresAt,
    });

    if (input.email) {
      const targetUser = await userRepository.findByEmail(input.email);
      if (targetUser) {
        const workspace = await workspaceRepository.findById(workspaceId);
        const notification = await notificationService.create({
          userId: targetUser.id,
          workspaceId,
          type: "WORKSPACE_INVITE",
          payload: {
            inviteToken: token,
            workspaceId,
            workspaceName: workspace?.name ?? "",
            invitedByName,
          },
        });

        emitToUser(targetUser.id, "notification:new", notification);
      }
    }

    auditLog({ workspaceId, action: "invite_created", metadata: { email: input.email, role: input.role } });
    return invite;
  },

  async acceptInvite(token: string, userId: string) {
    const invite = await workspaceInviteRepository.findByToken(token);

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new AppError("Invite is invalid or has expired", 400);
    }

    const existingMembership = await workspaceRepository.findMember(invite.workspaceId, userId);
    if (existingMembership) {
      throw new AppError("You are already a member of this workspace", 409);
    }

    const member = await workspaceRepository.addMember(invite.workspaceId, userId, invite.role);
    await workspaceInviteRepository.markAccepted(invite.id);
    auditLog({ workspaceId: invite.workspaceId, userId, action: "invite_accepted", metadata: { role: invite.role } });

    return member;
  },
};