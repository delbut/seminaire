import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// body: { pick1Id, pick2Id } — the 2 players joining the lone player in team 6
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.pick1Id && body.pick2Id) {
    // Find donor teams
    const [m1, m2] = await Promise.all([
      prisma.teamMember.findFirst({ where: { participantId: body.pick1Id } }),
      prisma.teamMember.findFirst({ where: { participantId: body.pick2Id } }),
    ]);

    // Remove pick1 and pick2 from their original teams
    await prisma.teamMember.deleteMany({
      where: { participantId: { in: [body.pick1Id, body.pick2Id] } },
    });

    // Merge the 2 donor teams' leftover players into one team
    if (m1?.teamId && m2?.teamId && m1.teamId !== m2.teamId) {
      const remaining = await prisma.teamMember.findFirst({ where: { teamId: m2.teamId } });
      if (remaining) {
        await prisma.teamMember.update({
          where: { id: remaining.id },
          data: { teamId: m1.teamId },
        });
        await prisma.team.delete({ where: { id: m2.teamId } });
      }
    }

    // Add pick1 and pick2 to team 6 (lone player already there)
    await prisma.teamMember.createMany({
      data: [
        { teamId: id, participantId: body.pick1Id },
        { teamId: id, participantId: body.pick2Id },
      ],
    });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { participant: true } } },
  });

  return NextResponse.json(team);
}
