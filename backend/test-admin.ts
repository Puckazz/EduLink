import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.admin.findUnique({ where: { admin_id: 22 } });
  console.log('Admin 22:', admin);
}
main().catch(console.error).finally(() => prisma.$disconnect());
