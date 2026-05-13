import { describe, it, expect } from "vitest";

// API route에서 사용하는 검증 로직을 순수 함수로 추출해 테스트
const CATEGORY_MAX = 20;
const KEY_MAX = 100;
const VALUE_MAX = 1000;
const QUERY_MAX = 100;
const NAME_MAX_LEN = 50;

function validateMemoryInput(category: unknown, key: unknown, value: unknown) {
  if (!category || !key || !value) return "category, key, value are required";
  if (typeof category !== "string" || typeof key !== "string" || typeof value !== "string")
    return "Invalid input types";
  if (category.length > CATEGORY_MAX) return `category max ${CATEGORY_MAX}`;
  if (key.length > KEY_MAX) return `key max ${KEY_MAX}`;
  if (value.length > VALUE_MAX) return `value max ${VALUE_MAX}`;
  return null;
}

function validateSearchQuery(q: unknown) {
  if (!q || typeof q !== "string") return "q parameter required";
  if (q.length > QUERY_MAX) return `query max ${QUERY_MAX} characters`;
  return null;
}

function validateApiKeyName(name: unknown) {
  if (!name || typeof name !== "string") return "name is required";
  if (name.trim().length === 0 || name.length > NAME_MAX_LEN)
    return `name must be 1–${NAME_MAX_LEN} characters`;
  return null;
}

describe("메모리 입력 검증", () => {
  it("정상 입력은 null 반환", () => {
    expect(validateMemoryInput("취향", "좋아하는 음식", "라멘")).toBeNull();
  });

  it("빈 값이면 에러 반환", () => {
    expect(validateMemoryInput("", "key", "value")).toBeTruthy();
    expect(validateMemoryInput("cat", "", "value")).toBeTruthy();
    expect(validateMemoryInput("cat", "key", "")).toBeTruthy();
  });

  it("null/undefined이면 에러 반환", () => {
    expect(validateMemoryInput(null, "key", "value")).toBeTruthy();
    expect(validateMemoryInput("cat", undefined, "value")).toBeTruthy();
  });

  it("숫자 타입이면 에러 반환", () => {
    expect(validateMemoryInput(123, "key", "value")).toBeTruthy();
  });

  it(`category가 ${CATEGORY_MAX}자를 초과하면 에러`, () => {
    expect(validateMemoryInput("a".repeat(CATEGORY_MAX + 1), "key", "val")).toBeTruthy();
  });

  it(`key가 ${KEY_MAX}자를 초과하면 에러`, () => {
    expect(validateMemoryInput("cat", "a".repeat(KEY_MAX + 1), "val")).toBeTruthy();
  });

  it(`value가 ${VALUE_MAX}자를 초과하면 에러`, () => {
    expect(validateMemoryInput("cat", "key", "a".repeat(VALUE_MAX + 1))).toBeTruthy();
  });

  it("정확히 최대 길이는 통과", () => {
    expect(validateMemoryInput(
      "a".repeat(CATEGORY_MAX),
      "a".repeat(KEY_MAX),
      "a".repeat(VALUE_MAX)
    )).toBeNull();
  });
});

describe("검색 쿼리 검증", () => {
  it("정상 쿼리는 null 반환", () => {
    expect(validateSearchQuery("라멘")).toBeNull();
  });

  it("빈 문자열이면 에러", () => {
    expect(validateSearchQuery("")).toBeTruthy();
  });

  it("null이면 에러", () => {
    expect(validateSearchQuery(null)).toBeTruthy();
  });

  it(`${QUERY_MAX}자 초과면 에러`, () => {
    expect(validateSearchQuery("a".repeat(QUERY_MAX + 1))).toBeTruthy();
  });

  it(`정확히 ${QUERY_MAX}자는 통과`, () => {
    expect(validateSearchQuery("a".repeat(QUERY_MAX))).toBeNull();
  });
});

describe("API 키 이름 검증", () => {
  it("정상 이름은 null 반환", () => {
    expect(validateApiKeyName("My Claude Key")).toBeNull();
  });

  it("null이면 에러", () => {
    expect(validateApiKeyName(null)).toBeTruthy();
  });

  it("공백만 있으면 에러", () => {
    expect(validateApiKeyName("   ")).toBeTruthy();
  });

  it(`${NAME_MAX_LEN}자 초과면 에러`, () => {
    expect(validateApiKeyName("a".repeat(NAME_MAX_LEN + 1))).toBeTruthy();
  });
});
