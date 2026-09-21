import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// body: { pick1Id, pick2Id }
// The 2 players STAY in their original teams and are ALSO added to team 6
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.pick1Id && body.pick2Id) {
    // Add pick1 and pick2 to team 6 (they remain in their original teams too)
    await prisma.teamMember.createMany({
      data: [
        { teamId: id, participantId: body.pick1Id },
        { teamId: id, participantId: body.pick2Id },
      ],
      skipDuplicates: true,
    });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { participant: true } } },
  });

  return NextResponse.json(team);
}
