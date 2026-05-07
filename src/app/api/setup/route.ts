import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getClerkUserId, generateApiKey } from "@/lib/auth";

// Clerk 로그인 사용자만 자신의 초기 API 키를 발급/조회
export async function POST() {
  try {
    const userId = await getClerkUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingKeyCount = await prisma.apiKey.count({ where: { userId } });

    if (existingKeyCount > 0) {
      // 기존 키 원문 재노출 금지 — 설정 페이지에서 새로 발급하도록 안내
      return NextResponse.json({
        message: "이미 초기화되어 있습니다. API 키는 설정 페이지에서 발급하세요.",
        alreadyInitialized: true,
      });
    }

    const key = generateApiKey();
    await prisma.apiKey.create({
      data: { key, userId, name: "기본 API 키" },
    });

    await prisma.memory.createMany({
      data: [
        { userId, category: "취향", key: "음식", value: "라멘, 초밥을 좋아함" },
        { userId, category: "취향", key: "여행", value: "자연 풍경 선호, 유럽 여행 희망" },
        { userId, category: "건강", key: "알레르기", value: "없음" },
        { userId, category: "목표", key: "올해 목표", value: "AI 서비스 MVP 출시" },
      ],
    });

    return NextResponse.json({ apiKey: key, message: "초기화 완료." });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
