import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_TOURNAMENTS = [
  "Ping-pong",
  "Babyfoot",
  "MarioKart",
  "Cornhole",
  "Nerf",
  "Tumbling Tower",
];

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      results: {
        include: { team: { include: { members: { include: { participant: true } } } } },
        orderBy: { position: "asc" },
      },
      mercenaryAssignments: {
        include: { participant: true, team: true },
      },
    },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const count = await prisma.tournament.count();
  const tournament = await prisma.tournament.create({
    data: { name, order: count },
  });
  return NextResponse.json(tournament);
}

// Seed default tournaments (called once after draw)
export async function PUT() {
  const existing = await prisma.tournament.count();
  if (existing > 0) return NextResponse.json({ ok: true, seeded: false });

  await prisma.tournament.createMany({
    data: DEFAULT_TOURNAMENTS.map((name, i) => ({ name, order: i })),
  });
  return NextResponse.json({ ok: true, seeded: true });
}
