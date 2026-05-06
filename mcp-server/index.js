#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const API_URL = process.env.MEMORY_STORE_URL || "http://localhost:3000";
const API_KEY = process.env.MEMORY_STORE_API_KEY || "";
async function callApi(path, method = "GET", body) {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return res.json();
}
const server = new McpServer({
    name: "memory-store",
    version: "1.0.0",
});
server.tool("get_memories", "사용자의 장기 메모리를 가져옵니다. 카테고리로 필터링 가능.", { category: z.string().optional().describe("필터링할 카테고리 (취향, 건강, 인간관계, 재무, 목표, 습관, 기타)") }, async ({ category }) => {
    const path = category ? `/api/memories?category=${encodeURIComponent(category)}` : "/api/memories";
    const data = await callApi(path);
    if (!data.memories?.length) {
        return { content: [{ type: "text", text: "저장된 메모리가 없습니다." }] };
    }
    const text = data.memories
        .map((m) => `[${m.category}] ${m.key}: ${m.value}`)
        .join("\n");
    return { content: [{ type: "text", text: `사용자 메모리 (${data.memories.length}개):\n\n${text}` }] };
});
server.tool("search_memories", "키워드로 사용자 메모리를 검색합니다.", { query: z.string().describe("검색 키워드") }, async ({ query }) => {
    const data = await callApi(`/api/search?q=${encodeURIComponent(query)}`);
    if (!data.memories?.length) {
        return { content: [{ type: "text", text: `"${query}"에 대한 메모리가 없습니다.` }] };
    }
    const text = data.memories
        .map((m) => `[${m.category}] ${m.key}: ${m.value}`)
        .join("\n");
    return { content: [{ type: "text", text: `"${query}" 검색 결과 (${data.memories.length}개):\n\n${text}` }] };
});
server.tool("save_memory", "사용자에 대해 학습한 정보를 장기 메모리에 저장합니다. 대화 중 사용자의 취향, 습관, 목표 등을 발견하면 저장하세요.", {
    category: z.enum(["취향", "건강", "인간관계", "재무", "목표", "습관", "기타"]).describe("메모리 카테고리"),
    key: z.string().describe("항목 이름 (예: 음식, 운동, 여행)"),
    value: z.string().describe("내용 (예: 라멘을 좋아함, 매일 아침 조깅)"),
}, async ({ category, key, value }) => {
    const data = await callApi("/api/memories", "POST", { category, key, value });
    if (data.memory) {
        return { content: [{ type: "text", text: `메모리 저장 완료: [${category}] ${key}: ${value}` }] };
    }
    return { content: [{ type: "text", text: "메모리 저장 실패" }] };
});
server.tool("delete_memory", "특정 메모리를 삭제합니다.", { id: z.string().describe("삭제할 메모리 ID") }, async ({ id }) => {
    const data = await callApi(`/api/memories/${id}`, "DELETE");
    return { content: [{ type: "text", text: data.success ? "삭제 완료" : "삭제 실패" }] };
});
const transport = new StdioServerTransport();
await server.connect(transport);
