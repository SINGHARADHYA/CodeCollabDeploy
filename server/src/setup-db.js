// This script creates the required database tables in your Supabase PostgreSQL.
// Run once: node src/setup-db.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table (stores saved code)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  active_file_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(user_id);
`;

async function setup() {
  try {
    console.log('🔧 Connecting to Supabase PostgreSQL...');
    await pool.query(SQL);
    console.log('✅ Tables created successfully!');
    console.log('   - users');
    console.log('   - workspaces');
    console.log('\n🎉 Database is ready! You can now start the server with: npm run dev');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

setup();
