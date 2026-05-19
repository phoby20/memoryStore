import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { decryptKey } from "@/lib/crypto";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GROQ_DAILY_BUDGET = 900;   // Groq free tier 1,000 RPD에서 10% 버퍼 제외
const FREE_LIMIT_MIN = 5;
const FREE_LIMIT_MAX = 50;

async function getFreeLimit(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split("T")[0];

  const result = await prisma.dailyUsage.groupBy({
    by: ["userId"],
    where: { date: { gte: since } },
  });
  const activeUsers = Math.max(result.length, 1);
  return Math.min(FREE_LIMIT_MAX, Math.max(FREE_LIMIT_MIN, Math.floor(GROQ_DAILY_BUDGET / activeUsers)));
}

async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date().toISOString().split("T")[0];
  const limit = await getFreeLimit();

  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  const used = usage?.count ?? 0;
  if (used >= limit) return { allowed: false, used, limit };

  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  });
  return { allowed: true, used: used + 1, limit };
}

const MEM_PATTERN = /<<<MEM:(\{.*?\})>>>/g;

function extractAndStripMems(text: string): { clean: string; mems: Array<{ category: string; key: string; value: string }> } {
  const mems: Array<{ category: string; key: string; value: string }> = [];
  const clean = text.replace(MEM_PATTERN, (_, json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.category && parsed.key && parsed.value) mems.push(parsed);
    } catch {}
    return "";
  }).trim();
  return { clean, mems };
}

function buildSystemPrompt(memories: Array<{ category: string; key: string; value: string }>) {
  const base = `당신은 사용자를 깊이 이해하는 개인 AI 어시스턴트입니다. 사용자와의 대화를 통해 중요한 정보를 기억하고, 그 정보를 바탕으로 더 개인화된 응답을 제공합니다.

반드시 사용자가 사용하는 언어로만 답변하세요. 사용자가 한국어로 말하면 한국어로만 답변하고, 다른 언어를 절대 섞지 마세요.

기억할 만한 새로운 정보가 대화 중에 나타나면, 응답 끝에 다음 형식으로 추가하세요 (사용자에게 보이지 않습니다):
<<<MEM:{"category": "카테고리", "key": "항목명", "value": "내용"}>>>

카테고리 예시: 취향, 건강, 인간관계, 재무, 목표, 습관, 기타`;

  if (memories.length === 0) return base;

  const memText = memories.map((m) => `[${m.category}] ${m.key}: ${m.value}`).join("\n");
  return `${base}\n\n## 사용자에 대해 알고 있는 것\n${memText}`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, message, model } = await req.json();
  if (!conversationId || !message || !model) {
    return NextResponse.json({ error: "conversationId, message, model required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const isGroqFree = model.startsWith("groq:");
  const actualModel = isGroqFree ? model.slice(5) : model;
  const provider = isGroqFree ? "groq" : actualModel.startsWith("gpt") ? "openai" : actualModel.startsWith("gemini") ? "gemini" : "claude";

  let apiKey: string;
  let groqUsed = 0, groqLimit = 0;

  if (isGroqFree) {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "서비스 무료 AI가 아직 설정되지 않았습니다." }, { status: 400 });
    }
    const { allowed, used, limit } = await checkAndIncrementUsage(userId);
    if (!allowed) {
      return NextResponse.json({
        error: `오늘의 무료 사용량(${limit}개)을 모두 사용했습니다. 내일 다시 시도하거나, 설정 > AI 설정에서 본인 API 키를 등록하세요.`,
      }, { status: 429 });
    }
    apiKey = process.env.GROQ_API_KEY;
    groqUsed = used;
    groqLimit = limit;
  } else {
    const aiKeyRecord = await prisma.aiApiKey.findUnique({ where: { userId_provider: { userId, provider } } });
    if (!aiKeyRecord) {
      return NextResponse.json({ error: `${provider} API 키가 설정되지 않았습니다. 설정 > AI 설정에서 추가해주세요.` }, { status: 400 });
    }
    apiKey = decryptKey(aiKeyRecord.encryptedKey);
  }

  const memories = await prisma.memory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const systemPrompt = buildSystemPrompt(memories);

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  await prisma.message.create({ data: { conversationId, role: "user", content: message } });

  const messages = [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let fullResponse = "";

      try {
        if (provider === "claude") {
          const client = new Anthropic({ apiKey });
          const stream = client.messages.stream({
            model: actualModel,
            max_tokens: 2048,
            system: systemPrompt,
            messages,
          });

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const text = chunk.delta.text;
              fullResponse += text;
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        } else if (provider === "openai") {
          const client = new OpenAI({ apiKey });
          const stream = await client.chat.completions.create({
            model: actualModel,
            stream: true,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
          });

          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        } else if (provider === "groq") {
          const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
          const stream = await client.chat.completions.create({
            model: actualModel,
            stream: true,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
          });

          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        } else if (provider === "gemini") {
          const genAI = new GoogleGenerativeAI(apiKey);
          const geminiModel = genAI.getGenerativeModel({
            model: actualModel,
            systemInstruction: systemPrompt,
          });
          const history = messages.slice(0, -1).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
          const chat = geminiModel.startChat({ history });
          const result = await chat.sendMessageStream(message);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        } else {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: "지원하지 않는 모델입니다." })}\n\n`));
          controller.close();
          return;
        }

        const { clean, mems } = extractAndStripMems(fullResponse);

        await prisma.message.create({ data: { conversationId, role: "assistant", content: clean } });
        await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

        if (history.length === 0) {
          const title = message.slice(0, 40) + (message.length > 40 ? "…" : "");
          await prisma.conversation.update({ where: { id: conversationId }, data: { title } });
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ titleUpdate: title })}\n\n`));
        }

        for (const mem of mems) {
          const existing = await prisma.memory.findFirst({ where: { userId, category: mem.category, key: mem.key } });
          if (existing) {
            await prisma.memory.update({ where: { id: existing.id }, data: { value: mem.value } });
          } else {
            const count = await prisma.memory.count({ where: { userId } });
            if (count < 1000) {
              await prisma.memory.create({ data: { userId, ...mem } });
            }
          }
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ memSaved: mem })}\n\n`));
        }

        if (isGroqFree) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ usageUpdate: { used: groqUsed, limit: groqLimit } })}\n\n`));
        }

        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (e) {
        console.error("[chat]", e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
