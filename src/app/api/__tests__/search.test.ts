import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  memory: { findMany: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ resolveUserId: vi.fn() }));

import { GET } from "../search/route";
import { resolveUserId } from "@/lib/auth";

const mockResolveUserId = vi.mocked(resolveUserId);

describe("GET /api/search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/search?q=라멘"));
    expect(res.status).toBe(401);
  });

  it("q 파라미터 없으면 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    const res = await GET(new NextRequest("http://localhost/api/search"));
    expect(res.status).toBe(400);
  });

  it("q가 100자 초과면 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    const res = await GET(new NextRequest(`http://localhost/api/search?q=${"a".repeat(101)}`));
    expect(res.status).toBe(400);
  });

  it("정상 검색 시 200 및 결과 반환", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.memory.findMany.mockResolvedValue([
      { id: "1", category: "취향", key: "음식", value: "라멘", updatedAt: new Date() },
    ]);
    const res = await GET(new NextRequest("http://localhost/api/search?q=라멘"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.memories).toHaveLength(1);
  });

  it("응답에 검색 쿼리(q)가 노출되지 않는다", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.memory.findMany.mockResolvedValue([]);
    const res = await GET(new NextRequest("http://localhost/api/search?q=secret"));
    const data = await res.json();
    expect(data).not.toHaveProperty("query");
    expect(JSON.stringify(data)).not.toContain("secret");
  });

  it("DB 오류 시 500", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.memory.findMany.mockRejectedValue(new Error("DB error"));
    const res = await GET(new NextRequest("http://localhost/api/search?q=test"));
    expect(res.status).toBe(500);
  });
});
