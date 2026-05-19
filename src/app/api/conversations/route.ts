import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, model: true, updatedAt: true },
  });
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, model } = await req.json();
  const conversation = await prisma.conversation.create({
    data: { userId, title: title || "새 대화", model: model || "claude-sonnet-4-6" },
  });
  return NextResponse.json(conversation);
}
