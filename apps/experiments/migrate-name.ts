console.log('Starting migration...');

import { PrismaClient } from 'database';

const prisma = new PrismaClient();

// async function updateInstanceNames() {
//   // Fetch all instances with the default name "Untitled Instance"
//   const instances = await prisma.instance.findMany({
//     where: {
//       name: 'Untitled Instance',
//       NOT: {
//         description: null,
//       },
//     },
//   });

//   // Update each instance to set the name to the description
//   for (const instance of instances) {
//     await prisma.instance.update({
//       where: {
//         id: instance.id,
//       },
//       data: {
//         name: instance.description!,
//       },
//     });
//   }

//   console.log(`Updated ${instances.length} instances.`);
// }

// try {
//   await updateInstanceNames();
// } catch (error) {
//   console.error(error);
//   process.exit(1);
// }

const users = await prisma.user.findMany({});
console.log(users.length);

console.log('Migration complete!');
