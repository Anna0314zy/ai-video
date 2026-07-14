import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'node:crypto'

const prisma = new PrismaClient()

const username = process.env.USERNAME
const password = process.env.PASSWORD
const workcode = process.env.WORKCODE || username
const email = process.env.EMAIL || ''

if (!username || !password) {
  console.error('Usage: USERNAME=<username> PASSWORD=<password> pnpm --filter @ai-video/server user:create')
  process.exit(1)
}

const salt = randomBytes(16).toString('hex')
const passwordHash = pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex')

const existingUser = await prisma.user.findFirst({
  where: { username },
})

if (existingUser) {
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      accountId: process.env.ACCOUNT_ID || String(existingUser.id),
      workcode,
      email,
      passwordHash,
      passwordSalt: salt,
    },
  })
  console.log(`Updated user: ${username}`)
} else {
  const user = await prisma.user.create({
    data: {
      accountId: `pending-${Date.now()}`,
      username,
      workcode,
      email,
      passwordHash,
      passwordSalt: salt,
    },
  })
  await prisma.user.update({
    where: { id: user.id },
    data: {
      accountId: process.env.ACCOUNT_ID || String(user.id),
    },
  })
  console.log(`Created user: ${username}`)
}

await prisma.$disconnect()
