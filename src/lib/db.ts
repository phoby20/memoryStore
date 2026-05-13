import { PrismaClient } from "@prisma/client";

type PrismaClientT = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientT | undefined };

function createPrismaClient(): PrismaClientT {
  const url = process.env.DATABASE_URL!;
  if (url.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: url }) as PrismaClientT;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
