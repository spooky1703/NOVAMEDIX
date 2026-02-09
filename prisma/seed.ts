import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('Admin123!', 12);

  await prisma.usuario.upsert({
    where: { email: 'admin@farmacia.com' },
    update: {},
    create: {
      email: 'admin@farmacia.com',
      password: passwordHash,
      nombre: 'Administrador',
      rol: 'SUPERADMIN',
      activo: true,
    },
  });

  console.log('✅ Usuario admin creado: admin@farmacia.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
