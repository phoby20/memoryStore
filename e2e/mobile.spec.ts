import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("모바일 레이아웃 - 랜딩 페이지", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
  });

  test("가로 스크롤이 발생하지 않는다", async ({ page }) => {
    // wait for fonts and layout to fully settle
    await page.waitForTimeout(300);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("히어로 버튼이 보인다", async ({ page }) => {
    await expect(page.getByText("무료로 시작하기 →")).toBeVisible();
  });

  test("히어로 우측 장식이 숨겨진다", async ({ page }) => {
    const heroRight = page.locator(".hero-right");
    const count = await heroRight.count();
    if (count > 0) {
      await expect(heroRight).not.toBeVisible();
    }
  });

  test("헤더의 네비게이션 메뉴 텍스트가 숨겨진다", async ({ page }) => {
    const navStart = page.locator(".landing-nav-start");
    const count = await navStart.count();
    if (count > 0) {
      await expect(navStart).not.toBeVisible();
    }
  });

  test("세 단계 섹션이 보인다", async ({ page }) => {
    await expect(page.getByText("세 단계면 충분합니다")).toBeVisible();
  });

  test("푸터 링크가 보인다", async ({ page }) => {
    await expect(page.getByRole("link", { name: "이용약관" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "개인정보 처리방침" })
    ).toBeVisible();
  });
});

test.describe("모바일 레이아웃 - 인증 리다이렉트", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("/dashboard는 모바일에서도 sign-in으로 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/sign-in|clerk/, { timeout: 8000 });
    expect(page.url()).toMatch(/sign-in|clerk/);
  });

  test("/settings는 모바일에서도 sign-in으로 리다이렉트", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/sign-in|clerk/, { timeout: 8000 });
    expect(page.url()).toMatch(/sign-in|clerk/);
  });
});
