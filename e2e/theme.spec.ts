import { test, expect } from "@playwright/test";

// localStorage 의존 테스트는 병렬 실행 시 서로 간섭하므로 순차 실행
test.describe.configure({ mode: "serial" });

test.describe("다크 모드", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 localStorage를 초기화해 이전 테스트 상태 제거
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("기본값은 라이트 모드 (시스템 설정 없을 때)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });

  test("시스템이 다크 모드이면 dark 테마 적용", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("dark");
  });

  test("localStorage에 dark가 있으면 다크 모드로 시작", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("dark");
  });

  test("localStorage에 light가 있으면 라이트 모드 유지", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });
});
