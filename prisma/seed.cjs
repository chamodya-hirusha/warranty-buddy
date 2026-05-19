const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin' },
  });

  // Default Repair Statuses
  const statuses = ['Pending', 'Diagnosing', 'Repairing', 'Completed', 'Delivered'];
  for (const status of statuses) {
    await prisma.repairStatus.upsert({
      where: { name: status },
      update: {},
      create: { name: status },
    });
  }

  // Create a Demo Tenant if not exists
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Business',
      slug: 'demo',
    },
  });

  // Create a Demo Branch
  await prisma.branch.create({
    data: {
      name: 'Main Branch',
      tenantId: demoTenant.id,
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
