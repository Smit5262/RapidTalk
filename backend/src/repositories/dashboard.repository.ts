import { prisma } from "../config/database";

export const dashboardRepository = {
  async getOverview(workspaceId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [messagesSent, activeUsersResult, filesShared, channelCount, aiUsageCount] =
      await Promise.all([
        prisma.message.count({
          where: { channel: { workspaceId }, isDeleted: false },
        }),
        prisma.message.findMany({
          where: {
            channel: { workspaceId },
            createdAt: { gte: sevenDaysAgo },
          },
          select: { authorId: true },
          distinct: ["authorId"],
        }),
        prisma.attachment.count({
          where: { message: { channel: { workspaceId } } },
        }),
        prisma.channel.count({
          where: { workspaceId, isArchived: false },
        }),
        prisma.aiLog.count({
          where: { workspaceId },
        }),
      ]);

    return {
      messagesSent,
      activeUsers: activeUsersResult.length,
      filesShared,
      channelCount,
      aiUsageCount,
    };
  },

  async getActivity(workspaceId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const messages = await prisma.message.findMany({
      where: {
        channel: { workspaceId },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    const dailyCounts: Record<string, number> = {};
    const hourlyByWeekday: Record<string, number> = {};
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (const m of messages) {
      const dayKey = m.createdAt.toISOString().split("T")[0];
      dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + 1;

      const weekday = weekdays[m.createdAt.getDay()];
      const hour = m.createdAt.getHours();
      const hourKey = `${weekday}-${hour}`;
      hourlyByWeekday[hourKey] = (hourlyByWeekday[hourKey] ?? 0) + 1;
    }

    return { dailyCounts, hourlyByWeekday };
  },

  async getRecent(workspaceId: string) {
    const auditLogs = await prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (auditLogs.length > 0) return auditLogs;

    const recentChannels = await prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, createdAt: true },
    });

    const recentMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      orderBy: { joinedAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    });

    return [
      ...recentChannels.map((c) => ({
        id: c.id,
        action: "channel_created",
        metadata: { channelName: c.name },
        createdAt: c.createdAt,
      })),
      ...recentMembers.map((m) => ({
        id: m.id,
        action: "member_joined",
        metadata: { userName: m.user.name },
        createdAt: m.joinedAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20);
  },
};
