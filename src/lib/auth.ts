import { prisma } from "./db";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

// 웹 UI: Clerk 세션 인증
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// MCP 서버: API 키 인증
export async function validateApiKey(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey) return null;

  return apiKey.userId;
}

// 웹 또는 API 키 중 하나로 인증
export async function resolveUserId(req: NextRequest): Promise<string | null> {
  // API 키 우선 (MCP 서버용)
  const apiKeyUserId = await validateApiKey(req);
  if (apiKeyUserId) return apiKeyUserId;

  // Clerk 세션 (웹 UI용)
  return getClerkUserId();
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "mem_" + Array.from(array, (b) => chars[b % chars.length]).join("");
}
