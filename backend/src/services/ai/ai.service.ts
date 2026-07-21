import { prisma } from "../../config/database";
import { messageRepository } from "../../repositories/message.repository";
import { AIProvider } from "./ai.provider.interface";
import { createGroqProvider } from "./providers/groq.provider";

let provider: AIProvider;

function getProvider(): AIProvider {
  if (!provider) provider = createGroqProvider();
  return provider;
}

async function logAiUsage(data: {
  workspaceId?: string;
  userId?: string;
  feature: string;
  promptTokens?: number;
  outputTokens?: number;
}) {
  try {
    await prisma.aiLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        feature: data.feature,
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        promptTokens: data.promptTokens,
        outputTokens: data.outputTokens,
      },
    });
  } catch {
    // fire-and-forget — don't block on log failures
  }
}

export const aiService = {
  async summarizeChannel(channelId: string, sinceMessageId?: string, userId?: string) {
    const where: Record<string, unknown> = { channelId, isDeleted: false };
    if (sinceMessageId) {
      const since = await messageRepository.findById(sinceMessageId);
      if (since) where.createdAt = { gt: since.createdAt };
    }

    const messages = await prisma.message.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const transcript = messages.map((m) => `${m.author.name}: ${m.content}`).join("\n");
    const prompt = `Summarize the following channel conversation concisely. Highlight key decisions, action items, and important topics discussed:\n\n${transcript}`;

    const result = await getProvider().complete(prompt, { maxTokens: 1024 });
    await logAiUsage({ feature: "summarize", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    return result.content;
  },

  async generateMeetingNotes(channelId: string, messageIds: string[], userId?: string) {
    const messages = await prisma.message.findMany({
      where: { id: { in: messageIds }, channelId, isDeleted: false },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    const transcript = messages.map((m) => `${m.author.name}: ${m.content}`).join("\n");
    const prompt = `Turn the following conversation into structured meeting notes. Format as:\n## Key Decisions\n- ...\n## Action Items\n- [ ] ...\n## Discussion Summary\n...\n\nConversation:\n${transcript}`;

    const result = await getProvider().complete(prompt, { maxTokens: 2048 });
    await logAiUsage({ feature: "meeting_notes", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    return result.content;
  },

  async translateMessage(content: string, targetLanguage: string, userId?: string) {
    const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else:\n\n${content}`;

    const result = await getProvider().complete(prompt, { maxTokens: 1024 });
    await logAiUsage({ feature: "translate", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    return result.content;
  },

  async rewriteMessage(content: string, tone: "professional" | "casual" | "concise", userId?: string) {
    const prompt = `Rewrite the following message in a ${tone} tone. Return ONLY the rewritten message:\n\n${content}`;

    const result = await getProvider().complete(prompt, { maxTokens: 1024 });
    await logAiUsage({ feature: "rewrite", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    return result.content;
  },

  async suggestReplies(channelId: string, userId?: string) {
    const messages = await prisma.message.findMany({
      where: { channelId, isDeleted: false },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const transcript = messages.reverse().map((m) => `${m.author.name}: ${m.content}`).join("\n");
    const prompt = `Based on the following conversation, suggest 2-3 short, natural reply messages. Return them as a JSON array of strings:\n\n${transcript}`;

    const result = await getProvider().complete(prompt, { maxTokens: 256 });
    await logAiUsage({ feature: "suggest_replies", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    try {
      return JSON.parse(result.content) as string[];
    } catch {
      return result.content.split("\n").filter((l) => l.trim()).slice(0, 3);
    }
  },

  async extractActionItems(content: string, userId?: string) {
    const prompt = `Extract action items from the following message. Return a JSON object with: { "tasks": [{ "title": string, "assignee": string | null, "dueDate": string | null }] }. Return ONLY the JSON:\n\n${content}`;

    const result = await getProvider().complete(prompt, { maxTokens: 512 });
    await logAiUsage({ feature: "extract_action_item", userId, promptTokens: result.promptTokens, outputTokens: result.outputTokens });

    try {
      return JSON.parse(result.content);
    } catch {
      return { tasks: [{ title: result.content.slice(0, 200), assignee: null, dueDate: null }] };
    }
  },
};
