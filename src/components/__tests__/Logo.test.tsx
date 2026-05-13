import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "../Logo";

describe("Logo", () => {
  it("Memory Store 텍스트를 렌더링한다", () => {
    render(<Logo />);
    expect(screen.getByText("Memory Store")).toBeInTheDocument();
  });

  it("SVG를 렌더링한다", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("기본 size가 26이다", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("26");
    expect(svg?.getAttribute("height")).toBe("26");
  });

  it("size prop이 적용된다", () => {
    const { container } = render(<Logo size={40} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("40");
    expect(svg?.getAttribute("height")).toBe("40");
  });
});
