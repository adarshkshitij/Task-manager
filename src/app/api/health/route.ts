import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      database: "reachable",
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
        hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      },
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        status: "error",
        database: "unreachable",
        env: {
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
          hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
        },
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
