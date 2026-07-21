export interface AIProvider {
  complete(prompt: string, opts?: { maxTokens?: number }): Promise<{
    content: string;
    promptTokens?: number;
    outputTokens?: number;
  }>;
}
