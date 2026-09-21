import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Update team 6 composition
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // body: { mode: "mercenary" | "trio", memberIds: string[], mercenaryId?: string }

  await prisma.teamMember.deleteMany({ where: { teamId: id } });

  if (body.memberIds?.length) {
    await prisma.teamMember.createMany({
      data: body.memberIds.map((participantId: string) => ({ teamId: id, participantId })),
    });
  }

  if (body.mode) {
    await prisma.settings.update({
      where: { id: "main" },
      data: {
        team6Mode: body.mode,
        mercenaryId: body.mercenaryId ?? null,
      },
    });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { participant: true } } },
  });

  return NextResponse.json(team);
}
