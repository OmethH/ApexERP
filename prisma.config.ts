import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrate: {
    async onMigrate({ datasourceUrl }) {
      return { datasourceUrl };
    },
  },
  migrations: {
    seed: "node --experimental-strip-types prisma/seed.mjs",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
