import { PrismaClient } from '@prisma/client';

// Una sola instancia en desarrollo (evita agotar conexiones con el hot-reload).
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
