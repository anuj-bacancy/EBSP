import { env } from "../src/lib/config/env";

async function main() {
  console.log("Northstar Supabase seed helper");
  console.log(`App URL: ${env.appUrl}`);
  console.log(`Supabase configured: ${Boolean(env.supabaseUrl && env.supabaseAnonKey)}`);
  console.log("");
  console.log("Apply the database schema and seed data in order:");
  console.log("1. supabase/migrations/202603140001_initial.sql");
  console.log("2. supabase/seed.sql");
  console.log("");
  console.log("This project no longer uses in-memory demo data. All dashboard and API flows read from Supabase.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
