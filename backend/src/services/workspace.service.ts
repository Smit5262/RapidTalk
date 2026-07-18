import { randomBytes } from "crypto";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { randomSuffix, slugify } from "../utils/slug";
import {
  workspaceInviteRepository,
  workspaceRepository,
} from "../repositories/workspace.repository";
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

    return workspaceRepository.create({ name: input.name, slug, ownerId: userId });
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

    return workspaceRepository.updateMemberRole(memberId, role);
  },

  async createInvite(workspaceId: string, input: CreateInviteInput) {
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);

    return workspaceInviteRepository.create({
      workspaceId,
      token,
      email: input.email,
      role: input.role,
      expiresAt,
    });
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

    return member;
  },
};