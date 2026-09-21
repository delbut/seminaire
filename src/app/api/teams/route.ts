import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [teams, settings] = await Promise.all([
    prisma.team.findMany({
      include: {
        members: { include: { participant: true } },
        results: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  let mercenary = null;
  if (settings?.mercenaryId) {
    mercenary = await prisma.participant.findUnique({
      where: { id: settings.mercenaryId },
    });
  }

  return NextResponse.json({ teams, settings, mercenary });
}
