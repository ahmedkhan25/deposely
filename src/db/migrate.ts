import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const migrationPath = path.join(__dirname, "migrations", "0001_init.sql");
  const migration = fs.readFileSync(migrationPath, "utf-8");

  // Split on semicolons and run each statement individually
  const statements = migration
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements...`);

  for (const statement of statements) {
    try {
      // Neon's sql() expects tagged template literals; use sql.call with raw string
      await sql([statement] as unknown as TemplateStringsArray);
      console.log("  ✓", statement.slice(0, 60).replace(/\n/g, " ") + "...");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Skip "already exists" errors for idempotency
      if (msg.includes("already exists")) {
        console.log("  ⊘ (already exists)", statement.slice(0, 60).replace(/\n/g, " "));
        continue;
      }
      console.error("  ✗ Failed:", statement.slice(0, 60).replace(/\n/g, " "));
      console.error("   ", msg);
      process.exit(1);
    }
  }

  console.log("Migration complete.");
}

migrate();
