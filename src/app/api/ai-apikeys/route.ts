import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { encryptKey, decryptKey } from "@/lib/crypto";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.aiApiKey.findMany({ where: { userId } });
  return NextResponse.json(
    keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      maskedKey: "••••••••" + decryptKey(k.encryptedKey).slice(-4),
      updatedAt: k.updatedAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, apiKey } = await req.json();
  if (!provider || !apiKey) {
    return NextResponse.json({ error: "provider and apiKey required" }, { status: 400 });
  }
  if (!["claude", "openai", "gemini"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const encryptedKey = encryptKey(apiKey);
  const record = await prisma.aiApiKey.upsert({
    where: { userId_provider: { userId, provider } },
    update: { encryptedKey },
    create: { userId, provider, encryptedKey },
  });

  return NextResponse.json({ id: record.id, provider: record.provider });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json();
  await prisma.aiApiKey.deleteMany({ where: { userId, provider } });
  return NextResponse.json({ ok: true });
}
