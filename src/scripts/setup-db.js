const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Helper to parse env variables manually from .env.local or .env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../.env.local'),
    path.join(__dirname, '../../.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          // Remove wrapping quotes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  }
}

async function main() {
  console.log('🏁 Starting database schema setup...');

  // Load env files
  loadEnv();

  // Get Database URL from environment
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(`
❌ Error: DATABASE_URL is not defined!
Please configure it in your .env.local file or pass it directly:

DATABASE_URL="postgresql://postgres:[PASSWORD]@db.mntdrrliioxetmkhtjmx.supabase.co:5432/postgres" npm run db:setup

You can find your database connection string in your Supabase Dashboard under:
Settings -> Database -> Connection string -> URI
`);
    process.exit(1);
  }

  // Read schema SQL file
  const schemaPath = path.join(__dirname, '../../supabase/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: schema.sql file not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log(`📄 Loaded schema.sql (${sql.length} bytes)`);

  // Initialize Postgres Client
  const client = new Client({
    connectionString: connectionString,
    // Add SSL support for Supabase database connections
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('🔨 Executing schema setup query...');
    await client.query(sql);
    console.log('🎉 Database build completed successfully! All tables, indexes, and triggers are created.');
  } catch (err) {
    console.error('\n❌ Database execution failed with the following error:\n');
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
