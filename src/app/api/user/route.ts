import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getClerkUserId } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

export async function DELETE() {
  try {
    const userId = await getClerkUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Clerk 계정 먼저 삭제 (이후 DB 삭제가 실패해도 로그인 불가)
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    // 서비스 DB 데이터 삭제
    await prisma.memory.deleteMany({ where: { userId } });
    await prisma.apiKey.deleteMany({ where: { userId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
