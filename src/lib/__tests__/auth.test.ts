import { describe, it, expect } from "vitest";
import { generateApiKey } from "../auth";

describe("generateApiKey", () => {
  it("mem_ 접두사로 시작한다", () => {
    expect(generateApiKey()).toMatch(/^mem_/);
  });

  it("총 길이가 36자 (mem_ 4자 + 랜덤 32자)", () => {
    expect(generateApiKey()).toHaveLength(36);
  });

  it("허용된 문자(영문+숫자)만 포함한다", () => {
    const key = generateApiKey();
    const random = key.slice(4);
    expect(random).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("호출마다 다른 키를 반환한다 (100회)", () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()));
    expect(keys.size).toBe(100);
  });

  it("랜덤 부분에 특수문자가 없다", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateApiKey().slice(4)).not.toMatch(/[^A-Za-z0-9]/);
    }
  });

  it("rejection sampling으로 생성된 키의 문자 분포가 고르다", () => {
    const freq: Record<string, number> = {};
    for (let i = 0; i < 6200; i++) {
      for (const ch of generateApiKey().slice(4)) {
        freq[ch] = (freq[ch] ?? 0) + 1;
      }
    }
    const counts = Object.values(freq);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    // 각 문자 빈도가 평균 ±30% 이내
    for (const c of counts) {
      expect(c).toBeGreaterThan(mean * 0.7);
      expect(c).toBeLessThan(mean * 1.3);
    }
  });
});
