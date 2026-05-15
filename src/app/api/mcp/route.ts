import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/auth";

const CATEGORY_MAX = 20;
const KEY_MAX = 100;
const VALUE_MAX = 1000;
const QUERY_MAX = 100;
const MAX_MEMORIES_PER_USER = 1000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id",
};

const TOOLS = [
  {
    name: "add_memory",
    description:
      "사용자의 기억을 저장하거나 업데이트합니다. 같은 category+key가 이미 있으면 value를 덮어씁니다.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "카테고리 (예: 취향, 건강, 인간관계, 재무, 목표, 습관, 기타)",
        },
        key: { type: "string", description: "항목명 (예: 좋아하는 음식)" },
        value: { type: "string", description: "내용 (예: 라멘을 특히 좋아함)" },
      },
      required: ["category", "key", "value"],
    },
  },
  {
    name: "get_memories",
    description: "저장된 기억 목록을 가져옵니다. category를 지정하면 해당 카테고리만 반환합니다.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "필터링할 카테고리 (생략 시 전체)" },
      },
    },
  },
  {
    name: "search_memories",
    description: "키워드로 기억을 검색합니다. category, key, value 모두 검색 대상입니다.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "검색 키워드" },
      },
      required: ["query"],
    },
  },
  {
    name: "delete_memory",
    description: "ID로 특정 기억을 삭제합니다. ID는 get_memories 또는 search_memories 결과에 포함됩니다.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "삭제할 기억의 ID" },
      },
      required: ["id"],
    },
  },
];

function ok(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { headers: CORS });
}

function err(id: unknown, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const userId = await validateApiKey(req);
  if (!userId) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Unauthorized: invalid or missing API key" } },
      { status: 401, headers: CORS }
    );
  }

  let body: { jsonrpc?: string; id?: unknown; method: string; params?: unknown };
  try {
    body = await req.json();
  } catch {
    return err(null, -32700, "Parse error");
  }

  const { id, method, params } = body;

  try {
    switch (method) {
      case "initialize":
        return ok(id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "memory-store", version: "1.0.0" },
        });

      case "notifications/initialized":
        return new NextResponse(null, { status: 204, headers: CORS });

      case "ping":
        return ok(id, {});

      case "tools/list":
        return ok(id, { tools: TOOLS });

      case "tools/call": {
        const { name, arguments: args = {} } = params as {
          name: string;
          arguments?: Record<string, string>;
        };

        if (name === "add_memory") {
          const { category, key, value } = args;
          if (!category || !key || !value)
            return err(id, -32602, "category, key, value are required");
          if (category.length > CATEGORY_MAX || key.length > KEY_MAX || value.length > VALUE_MAX)
            return err(id, -32602, `Too long (category≤${CATEGORY_MAX}, key≤${KEY_MAX}, value≤${VALUE_MAX})`);

          const count = await prisma.memory.count({ where: { userId } });
          if (count >= MAX_MEMORIES_PER_USER)
            return err(id, -32603, `최대 ${MAX_MEMORIES_PER_USER}개까지 저장 가능합니다`);

          const existing = await prisma.memory.findFirst({ where: { userId, category, key } });
          const memory = existing
            ? await prisma.memory.update({ where: { id: existing.id }, data: { value } })
            : await prisma.memory.create({ data: { userId, category, key, value } });

          return ok(id, {
            content: [{
              type: "text",
              text: `저장 완료: [${memory.category}] ${memory.key} = ${memory.value}`,
            }],
          });
        }

        if (name === "get_memories") {
          const { category } = args;
          const memories = await prisma.memory.findMany({
            where: { userId, ...(category ? { category } : {}) },
            orderBy: { updatedAt: "desc" },
            take: 500,
          });
          const text =
            memories.length === 0
              ? "저장된 기억이 없습니다."
              : memories
                  .map((m) => `[${m.category}] ${m.key}: ${m.value}  (id: ${m.id})`)
                  .join("\n");
          return ok(id, { content: [{ type: "text", text }] });
        }

        if (name === "search_memories") {
          const { query } = args;
          if (!query) return err(id, -32602, "query is required");
          if (query.length > QUERY_MAX) return err(id, -32602, "query too long");

          const memories = await prisma.memory.findMany({
            where: {
              userId,
              OR: [
                { key: { contains: query, mode: "insensitive" } },
                { value: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
              ],
            },
            orderBy: { updatedAt: "desc" },
            take: 20,
          });
          const text =
            memories.length === 0
              ? `"${query}"에 해당하는 기억이 없습니다.`
              : memories
                  .map((m) => `[${m.category}] ${m.key}: ${m.value}  (id: ${m.id})`)
                  .join("\n");
          return ok(id, { content: [{ type: "text", text }] });
        }

        if (name === "delete_memory") {
          const { id: memId } = args;
          if (!memId) return err(id, -32602, "id is required");

          const existing = await prisma.memory.findFirst({ where: { id: memId, userId } });
          if (!existing) return err(id, -32602, "해당 기억을 찾을 수 없습니다");

          await prisma.memory.delete({ where: { id: memId } });
          return ok(id, {
            content: [{
              type: "text",
              text: `삭제 완료: [${existing.category}] ${existing.key}`,
            }],
          });
        }

        return err(id, -32601, `Unknown tool: ${name}`);
      }

      default:
        return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    console.error("[MCP]", e);
    return err(id, -32603, "Internal server error");
  }
}
