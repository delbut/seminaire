import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Wipes every participant, team, tournament, match and result — back to a blank site.
export async function POST() {
  await prisma.tournamentResult.deleteMany();
  await prisma.match.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.tournament.deleteMany();

  await prisma.settings.upsert({
    where: { id: "main" },
    update: { drawCompleted: false },
    create: { id: "main", drawCompleted: false },
  });

  return NextResponse.json({ ok: true });
}
