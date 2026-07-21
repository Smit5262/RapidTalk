import Groq from "groq-sdk";
import { env } from "../../../config/env";
import { AIProvider } from "../ai.provider.interface";

const MODEL = "llama-3.3-70b-versatile";

export function createGroqProvider(): AIProvider {
  const client = new Groq({ apiKey: env.GROQ_API_KEY });

  return {
    async complete(prompt, opts) {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: opts?.maxTokens ?? 2048,
        temperature: 0.3,
      });

      const choice = response.choices[0];
      return {
        content: choice?.message?.content ?? "",
        promptTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      };
    },
  };
}
