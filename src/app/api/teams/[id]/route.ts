import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Update team 6 composition
// body: { mode, pick1Id, pick2Id } — the 2 players chosen to join the mercenary in team 6
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.pick1Id && body.pick2Id) {
    // Find which teams pick1 and pick2 currently belong to
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
      const remaining2 = await prisma.teamMember.findFirst({ where: { teamId: m2.teamId } });
      if (remaining2) {
        // Move m2's remaining player into m1's team and delete m2's team
        await prisma.teamMember.update({
          where: { id: remaining2.id },
          data: { teamId: m1.teamId },
        });
        await prisma.team.delete({ where: { id: m2.teamId } });
      }
    }

    // Set team 6 members: mercenary + pick1 + pick2
    const settings = await prisma.settings.findUnique({ where: { id: "main" } });
    await prisma.teamMember.deleteMany({ where: { teamId: id } });

    const memberIds = [body.pick1Id, body.pick2Id];
    if (settings?.mercenaryId) memberIds.push(settings.mercenaryId);

    await prisma.teamMember.createMany({
      data: memberIds.map((participantId) => ({ teamId: id, participantId })),
    });
  }

  if (body.mode) {
    await prisma.settings.update({
      where: { id: "main" },
      data: { team6Mode: body.mode },
    });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { participant: true } } },
  });

  return NextResponse.json(team);
}
