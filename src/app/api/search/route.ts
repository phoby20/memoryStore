import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveUserId } from "@/lib/auth";

const QUERY_MAX = 100;

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ error: "q parameter required" }, { status: 400 });
    if (q.length > QUERY_MAX) {
      return NextResponse.json({ error: `query max ${QUERY_MAX} characters` }, { status: 400 });
    }

    const memories = await prisma.memory.findMany({
      where: {
        userId,
        OR: [
          { key: { contains: q } },
          { value: { contains: q } },
          { category: { contains: q } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ memories });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
