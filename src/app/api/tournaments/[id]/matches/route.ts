import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pointsForPosition, rankTeams } from "@/lib/scoring";

const include = {
  teamA: { include: { members: { include: { participant: true } } } },
  teamB: { include: { members: { include: { participant: true } } } },
};

// Returns the round-robin matches for a tournament, generating them the first time.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params;

  const existing = await prisma.match.findMany({ where: { tournamentId }, include });
  if (existing.length > 0) return NextResponse.json(existing);

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const pairs: { teamAId: string; teamBId: string }[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push({ teamAId: teams[i].id, teamBId: teams[j].id });
    }
  }

  await prisma.match.createMany({
    data: pairs.map((p) => ({ tournamentId, ...p })),
  });

  const created = await prisma.match.findMany({ where: { tournamentId }, include });
  return NextResponse.json(created);
}

// body: { matches: [{ id, scoreA, scoreB }], activePlayerId?: string | null }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params;
  const body = await req.json();
  const matchUpdates = body.matches as { id: string; scoreA: number | null; scoreB: number | null }[];

  await Promise.all(
    matchUpdates.map(({ id, scoreA, scoreB }) =>
      prisma.match.update({ where: { id }, data: { scoreA, scoreB } })
    )
  );

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const matches = await prisma.match.findMany({ where: { tournamentId } });

  const ranking = rankTeams(teams.map((t) => t.id), matches);
  const allPlayed = matches.length > 0 && matches.every((m) => m.scoreA !== null && m.scoreB !== null);

  await prisma.tournamentResult.deleteMany({ where: { tournamentId } });
  if (allPlayed) {
    await prisma.tournamentResult.createMany({
      data: ranking.map((teamId, i) => ({
        tournamentId,
        teamId,
        position: i + 1,
        points: pointsForPosition(i + 1),
      })),
    });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: allPlayed ? "completed" : "pending",
      activePlayerId: body.activePlayerId ?? null,
    },
  });

  const updatedMatches = await prisma.match.findMany({ where: { tournamentId }, include });
  return NextResponse.json(updatedMatches);
}
