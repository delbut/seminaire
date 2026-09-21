import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PARTICIPANTS = [
  "Raphael", "Camilo", "Pierre", "Romain", "Isuri",
  "Simon", "Faisal", "Patrick", "Ma Mariam", "Frederic", "Maxime",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST() {
  // Wipe existing draw
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.participant.deleteMany();

  const shuffled = shuffle(PARTICIPANTS);

  // Create participants
  const participants = await Promise.all(
    shuffled.map((name) => prisma.participant.create({ data: { name } }))
  );

  // Teams 1–5: 2 players each (indices 0–9)
  // Team 6 (flexible): player at index 10 is the mercenary by default
  const teams = [];
  for (let i = 0; i < 5; i++) {
    const team = await prisma.team.create({
      data: { name: `Équipe ${i + 1}` },
    });
    await prisma.teamMember.createMany({
      data: [
        { teamId: team.id, participantId: participants[i * 2].id },
        { teamId: team.id, participantId: participants[i * 2 + 1].id },
      ],
    });
    teams.push(team);
  }

  // Team 6 (flexible) — starts with player index 10 as mercenary (no permanent member yet)
  const team6 = await prisma.team.create({
    data: { name: "Équipe 6", isFlexible: true },
  });

  // Save mercenary id in settings
  await prisma.settings.upsert({
    where: { id: "main" },
    update: { drawCompleted: true, team6Mode: "mercenary", mercenaryId: participants[10].id },
    create: { id: "main", drawCompleted: true, team6Mode: "mercenary", mercenaryId: participants[10].id },
  });

  return NextResponse.json({ ok: true, team6Id: team6.id, mercenaryId: participants[10].id });
}
