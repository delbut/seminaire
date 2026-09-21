import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { participant: true } },
      results: {
        include: { tournament: true },
        orderBy: { tournament: { order: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });

  const settings = await prisma.settings.findUnique({ where: { id: "main" } });

  const leaderboard = teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      isFlexible: team.isFlexible,
      members: team.members.map((m) => m.participant.name),
      totalPoints: team.results.reduce((sum, r) => sum + r.points, 0),
      results: team.results.map((r) => ({
        tournamentId: r.tournamentId,
        tournamentName: r.tournament.name,
        position: r.position,
        points: r.points,
      })),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks (handle ties)
  let rank = 1;
  for (let i = 0; i < leaderboard.length; i++) {
    if (i > 0 && leaderboard[i].totalPoints < leaderboard[i - 1].totalPoints) {
      rank = i + 1;
    }
    (leaderboard[i] as Record<string, unknown>).rank = rank;
  }

  return NextResponse.json({ leaderboard, settings });
}
