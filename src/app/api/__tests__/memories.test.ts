import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  memory: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ resolveUserId: vi.fn() }));

import { GET, POST } from "../memories/route";
import { resolveUserId } from "@/lib/auth";

const mockResolveUserId = vi.mocked(resolveUserId);

function makeRequest(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/memories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401 반환", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await GET(makeRequest("GET", "http://localhost/api/memories"));
    expect(res.status).toBe(401);
  });

  it("인증 성공 시 메모리 목록 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    mockPrisma.memory.findMany.mockResolvedValue([
      { id: "1", category: "취향", key: "음식", value: "라멘", updatedAt: new Date() },
    ]);
    const res = await GET(makeRequest("GET", "http://localhost/api/memories"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.memories).toHaveLength(1);
    expect(data.memories[0].key).toBe("음식");
  });

  it("DB 오류 시 500 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    mockPrisma.memory.findMany.mockRejectedValue(new Error("DB error"));
    const res = await GET(makeRequest("GET", "http://localhost/api/memories"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/memories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401 반환", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "음식", value: "라멘" }));
    expect(res.status).toBe(401);
  });

  it("필수 필드 누락 시 400 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "" }));
    expect(res.status).toBe(400);
  });

  it("value 누락 시 400 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "음식" }));
    expect(res.status).toBe(400);
  });

  it("메모리 개수 초과 시 400 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    mockPrisma.memory.count.mockResolvedValue(1000);
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "음식", value: "라멘" }));
    expect(res.status).toBe(400);
  });

  it("신규 생성 성공 시 201 반환", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    mockPrisma.memory.count.mockResolvedValue(0);
    mockPrisma.memory.findFirst.mockResolvedValue(null);
    mockPrisma.memory.create.mockResolvedValue({ id: "new1", category: "취향", key: "음식", value: "라멘", updatedAt: new Date() });
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "음식", value: "라멘" }));
    expect(res.status).toBe(201);
  });

  it("같은 key 존재 시 update (upsert)", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    mockPrisma.memory.count.mockResolvedValue(5);
    mockPrisma.memory.findFirst.mockResolvedValue({ id: "exist1" });
    mockPrisma.memory.update.mockResolvedValue({ id: "exist1", category: "취향", key: "음식", value: "파스타", updatedAt: new Date() });
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", { category: "취향", key: "음식", value: "파스타" }));
    expect(res.status).toBe(201);
    expect(mockPrisma.memory.update).toHaveBeenCalledOnce();
    expect(mockPrisma.memory.create).not.toHaveBeenCalled();
  });

  it("category 길이 초과 시 400", async () => {
    mockResolveUserId.mockResolvedValue("user123");
    const res = await POST(makeRequest("POST", "http://localhost/api/memories", {
      category: "a".repeat(21), key: "음식", value: "라멘",
    }));
    expect(res.status).toBe(400);
  });
});
