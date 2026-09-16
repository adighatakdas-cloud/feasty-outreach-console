import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/feasty";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
