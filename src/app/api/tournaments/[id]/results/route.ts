import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pointsForPosition } from "@/lib/scoring";

// body: { results: [{teamId, position}], mercenaryTeamId?: string }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await prisma.tournamentResult.deleteMany({ where: { tournamentId: id } });

  const results = body.results as { teamId: string; position: number }[];
  if (results?.length) {
    await prisma.tournamentResult.createMany({
      data: results.map(({ teamId, position }) => ({
        tournamentId: id,
        teamId,
        position,
        points: pointsForPosition(position),
      })),
    });
  }

  if (body.mercenaryTeamId !== undefined) {
    await prisma.mercenaryAssignment.deleteMany({ where: { tournamentId: id } });
    if (body.mercenaryTeamId) {
      const settings = await prisma.settings.findUnique({ where: { id: "main" } });
      if (settings?.mercenaryId) {
        await prisma.mercenaryAssignment.create({
          data: {
            tournamentId: id,
            teamId: body.mercenaryTeamId,
            participantId: settings.mercenaryId,
          },
        });
      }
    }
  }

  // Mark tournament completed if results exist
  if (results?.length > 0) {
    await prisma.tournament.update({
      where: { id },
      data: { status: "completed" },
    });
  } else {
    await prisma.tournament.update({
      where: { id },
      data: { status: "pending" },
    });
  }

  return NextResponse.json({ ok: true });
}
