import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveUserId, generateApiKey } from "@/lib/auth";

const NAME_MAX_LEN = 50;
const MAX_KEYS_PER_USER = 10;

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      // key 전체를 반환하지 않고 앞 8자 + 마스킹만 반환
      select: { id: true, name: true, createdAt: true, key: true },
      orderBy: { createdAt: "desc" },
    });

    const masked = keys.map((k) => ({
      id: k.id,
      name: k.name,
      createdAt: k.createdAt,
      keyPreview: k.key.slice(0, 12) + "••••••••••••••••••••",
    }));

    return NextResponse.json({ keys: masked });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (name.trim().length === 0 || name.length > NAME_MAX_LEN) {
      return NextResponse.json({ error: `name must be 1–${NAME_MAX_LEN} characters` }, { status: 400 });
    }

    const keyCount = await prisma.apiKey.count({ where: { userId } });
    if (keyCount >= MAX_KEYS_PER_USER) {
      return NextResponse.json({ error: `API 키는 최대 ${MAX_KEYS_PER_USER}개까지 발급할 수 있습니다.` }, { status: 400 });
    }

    const key = generateApiKey();
    const apiKey = await prisma.apiKey.create({ data: { key, userId, name: name.trim() } });

    // 신규 발급 시에만 전체 키 반환 (이후 조회에서는 마스킹)
    return NextResponse.json({
      apiKey: { id: apiKey.id, name: apiKey.name, createdAt: apiKey.createdAt, key },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.apiKey.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.apiKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
