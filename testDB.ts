import { prisma } from './lib/prisma'

async function main() {
  // Create or get a user by unique email to avoid duplicate errors
  const user = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {
        name: "admin",
        email: "dlexteriaque@gmail.com",
        password: "passtest"
    },
    create: {
      name: 'Alice',
      email: 'alice@prisma.io',
      password: 'test'
    }
  })
  console.log('Created user:', user)

  const allUsers = await prisma.user.findMany()
  console.log('All users:', JSON.stringify(allUsers, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })