import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// matchMedia mock
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: query.includes("dark") ? false : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

function ThemeDisplay() {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("기본값은 light 테마", () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("localStorage에 dark가 저장되어 있으면 dark 테마로 시작", async () => {
    localStorageMock.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    // useEffect 후 업데이트 대기
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("toggle 클릭 시 dark로 전환", async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("toggle 두 번 클릭 시 light로 복귀", async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("toggle 클릭 시 localStorage에 저장", async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(screen.getByText("toggle"));
    expect(localStorageMock.getItem("theme")).toBe("dark");
  });

  it("toggle 클릭 시 html data-theme 속성 변경", async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(screen.getByText("toggle"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
