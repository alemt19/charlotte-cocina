
import { PrismaClient } from '../generated/prisma/index.js';

// Patrón Singleton para evitar múltiples conexiones en desarrollo (Hot Reload)
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
