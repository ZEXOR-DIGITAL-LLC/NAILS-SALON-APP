import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    // Seed command (if you have a seed file)
    // seed: 'tsx prisma/seed.ts',
  },

  datasource: {
    // Use DIRECT_URL for migrations (bypasses connection pooler)
    url: process.env.DIRECT_URL!,
  },
})
