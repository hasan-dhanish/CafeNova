import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let dbUrl: string | undefined = undefined;

  // In Vercel / AWS Lambda serverless environments, the root directory is read-only.
  // We copy the bundled SQLite database to /tmp/cafenova.db so SQLite can read and write orders.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.TMPDIR) {
    try {
      const tmpDir = process.env.TMPDIR || '/tmp';
      const tmpDbPath = path.join(tmpDir, 'cafenova.db');

      const possibleSources = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), '.next', 'server', 'prisma', 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, 'prisma', 'dev.db'),
      ];

      let foundSource: string | null = null;
      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          foundSource = src;
          break;
        }
      }

      if (foundSource) {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(foundSource, tmpDbPath);
        }
        dbUrl = `file:${tmpDbPath}`;
      }
    } catch (err) {
      console.warn('Could not copy SQLite database to /tmp:', err);
    }
  }

  const client = new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
export default prisma;
