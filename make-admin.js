const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.error('❌ Ошибка: Не указан email.');
  console.log('Использование: node make-admin.js vash-email@example.com');
  process.exit(1);
}

async function main() {
  console.log(`🔍 Ищу пользователя с email: ${email}...`);
  
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Успешно! Пользователь ${user.email} теперь имеет права администратора (ADMIN).`);
    console.log('Теперь вы можете зайти в панель управления: http://localhost:3000/admin');
  } catch (e) {
    if (e.code === 'P2025') {
      console.error(`❌ Ошибка: Пользователь с email "${email}" не найден в базе данных.`);
      console.log('Убедитесь, что вы уже зарегистрировались на сайте.');
    } else {
      console.error('❌ Произошла ошибка:', e);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
