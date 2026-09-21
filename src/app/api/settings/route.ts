import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const settings = await prisma.settings.upsert({
    where: { id: "main" },
    update: body,
    create: { id: "main", ...body },
  });
  return NextResponse.json(settings);
}
