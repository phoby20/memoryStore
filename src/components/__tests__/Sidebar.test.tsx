import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button" />,
}));

const mockToggle = vi.fn();
vi.mock("../ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", toggle: mockToggle }),
}));

describe("Sidebar", () => {
  it("로고를 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("Memory Store")).toBeInTheDocument();
  });

  it("기억 지도 메뉴가 있다", () => {
    render(<Sidebar />);
    expect(screen.getByText("기억 지도")).toBeInTheDocument();
  });

  it("설정 메뉴가 있다", () => {
    render(<Sidebar />);
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("UserButton을 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });

  it("다크 모드 토글 버튼이 있다", () => {
    render(<Sidebar />);
    expect(screen.getByText("다크 모드")).toBeInTheDocument();
  });

  it("/dashboard 경로에서 기억 지도 링크 href가 맞다", () => {
    render(<Sidebar />);
    const link = screen.getByText("기억 지도").closest("a");
    expect(link?.getAttribute("href")).toBe("/dashboard");
  });

  it("테마 토글 버튼 클릭 시 toggle이 호출된다", () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("다크 모드로 전환"));
    expect(mockToggle).toHaveBeenCalledOnce();
  });
});
