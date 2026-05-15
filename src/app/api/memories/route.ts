import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveUserId } from "@/lib/auth";

const CATEGORY_MAX = 20;
const KEY_MAX = 100;
const VALUE_MAX = 1000;
const MAX_MEMORIES_PER_USER = 1000;
const GET_LIMIT = 500;

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const memories = await prisma.memory.findMany({
      where: { userId, ...(category ? { category } : {}) },
      orderBy: { updatedAt: "desc" },
      take: GET_LIMIT,
    });

    return NextResponse.json({ memories });
  } catch (e) {
    console.error("[GET /api/memories]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { category, key, value } = body;

    if (!category || !key || !value) {
      return NextResponse.json({ error: "category, key, value are required" }, { status: 400 });
    }
    if (typeof category !== "string" || typeof key !== "string" || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
    }
    if (category.length > CATEGORY_MAX || key.length > KEY_MAX || value.length > VALUE_MAX) {
      return NextResponse.json({
        error: `category max ${CATEGORY_MAX}, key max ${KEY_MAX}, value max ${VALUE_MAX} characters`,
      }, { status: 400 });
    }

    const memoryCount = await prisma.memory.count({ where: { userId } });
    if (memoryCount >= MAX_MEMORIES_PER_USER) {
      return NextResponse.json({ error: `메모리는 최대 ${MAX_MEMORIES_PER_USER}개까지 저장할 수 있습니다.` }, { status: 400 });
    }

    const existing = await prisma.memory.findFirst({ where: { userId, category, key } });
    let memory;
    if (existing) {
      memory = await prisma.memory.update({ where: { id: existing.id }, data: { value } });
    } else {
      memory = await prisma.memory.create({ data: { userId, category, key, value } });
    }

    return NextResponse.json({ memory }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/memories]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
