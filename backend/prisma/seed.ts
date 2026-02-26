import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Tạo Admin (password đã hash)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      full_name: 'Quản trị viên',
      email: 'admin@edulink.vn',
    },
  });
  console.log('✅ Admin created:', admin.username);

  // 2. Tạo Parent (chưa kích hoạt, chưa có password)
  const parent = await prisma.parent.upsert({
    where: { phone: '0901234567' },
    update: {},
    create: {
      full_name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'parent@gmail.com',
      password: null,
      is_active: false,
    },
  });
  console.log('✅ Parent created:', parent.phone);

  // 3. Tạo Student liên kết với Parent
  const student = await prisma.student.upsert({
    where: { student_code: 'HS2024001' },
    update: {},
    create: {
      student_code: 'HS2024001',
      full_name: 'Nguyễn Văn B',
      parent_id: parent.parent_id,
    },
  });
  console.log('✅ Student created:', student.student_code);

  console.log('\n🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
