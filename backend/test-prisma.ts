import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({ where: { target_role: 'admin' } });
  console.log('Admin notifications:', notifs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
