import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const DEFAULT_DIRECT_URL =
  'postgresql://postgres:BalladeOp38_Fmajor@db.vanpniumrtgctqobfzmw.supabase.co:5432/postgres';
const DEFAULT_POOLER_URL =
  'postgresql://postgres.vanpniumrtgctqobfzmw:BalladeOp38_Fmajor@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

async function getConnectedClient(): Promise<Client> {
  const primaryUrl = process.env.DATABASE_URL || DEFAULT_POOLER_URL;

  console.log('Connecting to Supabase Postgres database...');
  try {
    const client = new Client({
      connectionString: primaryUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    await client.connect();
    console.log('Connected successfully to database.');
    return client;
  } catch (err: any) {
    if (primaryUrl !== DEFAULT_POOLER_URL) {
      console.warn(`Primary connection failed (${err.message}). Trying IPv4 pooler fallback...`);
      const fallbackClient = new Client({
        connectionString: DEFAULT_POOLER_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await fallbackClient.connect();
      console.log('Connected successfully via IPv4 connection pooler.');
      return fallbackClient;
    }
    throw err;
  }
}

async function runMigrations() {
  const client = await getConnectedClient();

  // Ensure schema_migrations table exists
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      statements text[],
      name text,
      created_by text,
      idempotency_key text,
      rollback text[]
    );
  `);

  const appliedRes = await client.query(
    'SELECT version, name FROM supabase_migrations.schema_migrations'
  );
  const appliedSet = new Set<string>();
  appliedRes.rows.forEach((r) => {
    if (r.name) {
      appliedSet.add(r.name);
      // Strip leading digits/underscore to normalize (e.g. 00006_storage_buckets -> storage_buckets)
      appliedSet.add(r.name.replace(/^\d+_/, ''));
    }
    if (r.version) appliedSet.add(r.version);
  });

  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`\nFound ${files.length} migration files in supabase/migrations:`);
  files.forEach((f) => console.log(` - ${f}`));

  let newlyApplied = 0;

  for (const file of files) {
    const baseName = file.replace(/\.sql$/, '');
    const normalizedName = baseName.replace(/^\d+_/, '');

    // Check if migration is already recorded
    const isApplied = appliedSet.has(baseName) || appliedSet.has(normalizedName);
    if (isApplied) {
      console.log(`↷ Skipping already applied migration ${file}`);
      continue;
    }

    const fullPath = path.join(migrationsDir, file);
    console.log(`\nExecuting migration ${file}...`);
    const sql = fs.readFileSync(fullPath, 'utf8');

    try {
      await client.query(sql);
      console.log(`✓ ${file} executed successfully.`);

      const version = new Date()
        .toISOString()
        .replace(/[-:T]/g, '')
        .slice(0, 14);

      await client.query(
        `INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
         VALUES ($1, ARRAY[$2], $3)
         ON CONFLICT (version) DO NOTHING;`,
        [version, sql, baseName]
      );
      appliedSet.add(baseName);
      newlyApplied++;
    } catch (err: any) {
      console.error(`✕ Error executing ${file}:`, err.message);
      throw err;
    }
  }

  console.log(`\nMigrations complete. ${newlyApplied} new migrations applied.`);

  // Execute seed.sql if it exists
  const seedPath = path.resolve(process.cwd(), 'supabase/seed.sql');
  if (fs.existsSync(seedPath)) {
    console.log('\nExecuting supabase/seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    try {
      await client.query(seedSql);
      console.log('✓ supabase/seed.sql executed successfully.');
    } catch (err: any) {
      console.error('✕ Error executing seed.sql:', err.message);
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
  const compImpactRes = await client.query(`
    SELECT impact_level, count(*) 
    FROM public.competitions 
    GROUP BY impact_level 
    ORDER BY count(*) DESC;
  `);

  console.log(`\nVerification Counts:`);
  console.log(` - Profiles: ${profileRes.rows[0].count}`);
  console.log(` - Competitions: ${compRes.rows[0].count}`);
  console.log(` - Links: ${linksRes.rows[0].count}`);
  console.log(`\nCompetitions by Impact Level:`);
  compImpactRes.rows.forEach((r) => console.log(` - ${r.impact_level}: ${r.count}`));

  await client.end();
  console.log('\nAll migrations and seed data applied successfully!');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
