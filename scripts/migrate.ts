import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:BalladeOp38_Fmajor@db.vanpniumrtgctqobfzmw.supabase.co:5432/postgres';

  console.log('Connecting to Supabase Postgres database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected successfully to database.');

  const migrationFiles = [
    'supabase/migrations/00001_initial_schema.sql',
    'supabase/migrations/00002_rls_policies.sql',
    'supabase/migrations/00003_triggers_and_functions.sql',
    'supabase/seed.sql',
  ];

  for (const relPath of migrationFiles) {
    const fullPath = path.resolve(process.cwd(), relPath);
    console.log(`\nExecuting ${relPath}...`);
    const sql = fs.readFileSync(fullPath, 'utf8');

    try {
      await client.query(sql);
      console.log(`✓ ${relPath} executed successfully.`);
    } catch (err: any) {
      console.error(`✕ Error executing ${relPath}:`, err.message);
      // If table/role already exists or notice, log details
      throw err;
    }
  }

  // Verify created tables
  console.log('\n--- Verifying Tables in public schema ---');
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log(`Total public tables/views: ${res.rows.length}`);
  res.rows.forEach((r) => console.log(` - ${r.table_name}`));

  // Verify profile count & competitions count
  const profileRes = await client.query('SELECT count(*) FROM public.profiles;');
  const compRes = await client.query('SELECT count(*) FROM public.competitions;');
  const linksRes = await client.query('SELECT count(*) FROM public.links;');
  console.log(`\nVerification Counts:`);
  console.log(` - Profiles: ${profileRes.rows[0].count}`);
  console.log(` - Competitions: ${compRes.rows[0].count}`);
  console.log(` - Links: ${linksRes.rows[0].count}`);

  await client.end();
  console.log('\nAll migrations and seed data applied successfully!');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
