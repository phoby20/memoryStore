import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getClerkUserId, generateApiKey } from "@/lib/auth";

// Clerk 로그인 사용자만 자신의 초기 API 키를 발급/조회
export async function POST() {
  try {
    const userId = await getClerkUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: { key: true, name: true },
    });

    if (existingKeys.length > 0) {
      return NextResponse.json({
        apiKey: existingKeys[0].key,
        message: "기존 API 키를 반환합니다.",
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
