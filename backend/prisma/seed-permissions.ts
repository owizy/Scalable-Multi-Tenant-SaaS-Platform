import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  const permissions = [
    { action: 'manage', resource: 'all' },
    { action: 'read', resource: 'Project' },
    { action: 'create', resource: 'Project' },
    { action: 'update', resource: 'Project' },
    { action: 'delete', resource: 'Project' },
    { action: 'read', resource: 'User' },
    { action: 'create', resource: 'User' },
    { action: 'update', resource: 'User' },
    { action: 'delete', resource: 'User' },
    { action: 'read', resource: 'Organization' },
    { action: 'update', resource: 'Organization' },
  ];

  console.log('Seeding global permissions...');

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource } },
      update: {},
      create: p,
    });
  }

  console.log('Permissions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Note: in a real script we would close the prisma client
  });
