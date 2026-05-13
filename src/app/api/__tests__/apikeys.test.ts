import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  apiKey: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  resolveUserId: vi.fn(),
  generateApiKey: vi.fn(() => "mem_testkey1234567890123456789012"),
}));

import { GET, POST, DELETE } from "../apikeys/route";
import { resolveUserId } from "@/lib/auth";

const mockResolveUserId = vi.mocked(resolveUserId);

function makeRequest(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/apikeys", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await GET(makeRequest("GET", "http://localhost/api/apikeys"));
    expect(res.status).toBe(401);
  });

  it("키 목록을 마스킹해서 반환", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.apiKey.findMany.mockResolvedValue([
      { id: "k1", name: "Claude", createdAt: new Date(), key: "mem_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456" },
    ]);
    const res = await GET(makeRequest("GET", "http://localhost/api/apikeys"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.keys[0].keyPreview).not.toContain("MNOPQRSTUVWXYZ123456");
    expect(data.keys[0]).not.toHaveProperty("key");
  });
});

describe("POST /api/apikeys", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", "http://localhost/api/apikeys", { name: "test" }));
    expect(res.status).toBe(401);
  });

  it("name 없으면 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    const res = await POST(makeRequest("POST", "http://localhost/api/apikeys", {}));
    expect(res.status).toBe(400);
  });

  it("공백만 있는 name은 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    const res = await POST(makeRequest("POST", "http://localhost/api/apikeys", { name: "   " }));
    expect(res.status).toBe(400);
  });

  it("키 10개 초과 시 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.apiKey.count.mockResolvedValue(10);
    const res = await POST(makeRequest("POST", "http://localhost/api/apikeys", { name: "new key" }));
    expect(res.status).toBe(400);
  });

  it("성공 시 201 및 전체 키 반환", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.apiKey.count.mockResolvedValue(0);
    mockPrisma.apiKey.create.mockResolvedValue({ id: "k1", name: "Claude", createdAt: new Date(), key: "mem_testkey1234567890123456789012" });
    const res = await POST(makeRequest("POST", "http://localhost/api/apikeys", { name: "Claude" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.apiKey.key).toBeTruthy();
  });
});

describe("DELETE /api/apikeys", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증 없으면 401", async () => {
    mockResolveUserId.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE", "http://localhost/api/apikeys?id=k1"));
    expect(res.status).toBe(401);
  });

  it("id 없으면 400", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    const res = await DELETE(makeRequest("DELETE", "http://localhost/api/apikeys"));
    expect(res.status).toBe(400);
  });

  it("본인 키가 아니면 404", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.apiKey.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE", "http://localhost/api/apikeys?id=other"));
    expect(res.status).toBe(404);
  });

  it("성공 시 200", async () => {
    mockResolveUserId.mockResolvedValue("user1");
    mockPrisma.apiKey.findFirst.mockResolvedValue({ id: "k1" });
    mockPrisma.apiKey.delete.mockResolvedValue({});
    const res = await DELETE(makeRequest("DELETE", "http://localhost/api/apikeys?id=k1"));
    expect(res.status).toBe(200);
  });
});
