import { test, expect } from "@playwright/test";

test.describe("미인증 접근 시 리다이렉트", () => {
  test("/dashboard는 sign-in으로 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/sign-in|clerk/, { timeout: 8000 });
    expect(page.url()).toMatch(/sign-in|clerk/);
  });

  test("/settings는 sign-in으로 리다이렉트", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/sign-in|clerk/, { timeout: 8000 });
    expect(page.url()).toMatch(/sign-in|clerk/);
  });
});

test.describe("인증 페이지", () => {
  test("sign-in 페이지가 로드된다", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    // Clerk 컴포넌트 또는 리다이렉트된 URL 확인
    expect(page.url()).toMatch(/sign-in|clerk/);
  });

  test("sign-up 페이지가 로드된다", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/sign-up|clerk/);
  });
});
