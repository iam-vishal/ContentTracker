import { defineConfig } from "drizzle-kit";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_8x0VnjZtEfFW@ep-cool-paper-a5wsytw7.us-east-2.aws.neon.tech/neondb?sslmode=require";
// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL, ensure the database is provisioned");
// }

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
