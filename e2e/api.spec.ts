import { test, expect } from "@playwright/test";

test.describe("API 엔드포인트 — 미인증 접근", () => {
  test("GET /api/memories → 401", async ({ request }) => {
    const res = await request.get("/api/memories");
    expect(res.status()).toBe(401);
  });

  test("POST /api/memories → 401", async ({ request }) => {
    const res = await request.post("/api/memories", {
      data: { category: "취향", key: "음식", value: "라멘" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/apikeys → 401", async ({ request }) => {
    const res = await request.get("/api/apikeys");
    expect(res.status()).toBe(401);
  });

  test("POST /api/apikeys → 401", async ({ request }) => {
    const res = await request.post("/api/apikeys", { data: { name: "test" } });
    expect(res.status()).toBe(401);
  });

  test("GET /api/search (q 없음) → 401", async ({ request }) => {
    const res = await request.get("/api/search");
    expect(res.status()).toBe(401);
  });

  test("GET /api/search (q 있음) → 401", async ({ request }) => {
    const res = await request.get("/api/search?q=test");
    expect(res.status()).toBe(401);
  });
});

test.describe("API 응답 헤더 보안", () => {
  test("X-Content-Type-Options: nosniff", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("X-Frame-Options: DENY", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("API 응답에 Cache-Control: no-store", async ({ request }) => {
    const res = await request.get("/api/memories");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});
