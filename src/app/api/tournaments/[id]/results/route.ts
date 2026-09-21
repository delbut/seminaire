import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pointsForPosition } from "@/lib/scoring";

// body: { results: [{teamId, position}], activePlayerId?: string }
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

  await prisma.tournament.update({
    where: { id },
    data: {
      status: results?.length > 0 ? "completed" : "pending",
      activePlayerId: body.activePlayerId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
