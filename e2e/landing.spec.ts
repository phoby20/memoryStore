import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("랜딩 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
  });

  test("페이지 타이틀이 Memory Store를 포함한다", async ({ page }) => {
    await expect(page).toHaveTitle(/Memory Store/);
  });

  test("로고가 보인다", async ({ page }) => {
    await expect(page.getByText("Memory Store").first()).toBeVisible();
  });

  test("히어로 헤드라인이 보인다", async ({ page }) => {
    await expect(page.getByText("두 번째 두뇌")).toBeVisible();
  });

  test("무료로 시작하기 버튼이 있다", async ({ page }) => {
    await expect(page.getByText("무료로 시작하기 →")).toBeVisible();
  });

  test("로그인 링크가 있다", async ({ page }) => {
    await expect(page.getByRole("link", { name: "로그인" }).first()).toBeVisible();
  });

  test("세 단계 섹션이 보인다", async ({ page }) => {
    await expect(page.getByText("세 단계면 충분합니다")).toBeVisible();
  });

  test("STEP 카드 3개가 모두 있다", async ({ page }) => {
    await expect(page.getByText("API 키 발급")).toBeVisible();
    await expect(page.getByText("AI 서비스에 연결")).toBeVisible();
    await expect(page.getByText("대화하면 자동 저장")).toBeVisible();
  });

  test("무료로 시작하기 버튼이 /sign-up으로 연결된다", async ({ page }) => {
    const link = page.getByRole("link", { name: "무료로 시작하기 →" });
    await expect(link).toHaveAttribute("href", "/sign-up");
  });

  test("이용약관 링크가 있다", async ({ page }) => {
    await expect(page.getByRole("link", { name: "이용약관" })).toBeVisible();
  });

  test("개인정보 처리방침 링크가 있다", async ({ page }) => {
    await expect(page.getByRole("link", { name: "개인정보 처리방침" })).toBeVisible();
  });
});
