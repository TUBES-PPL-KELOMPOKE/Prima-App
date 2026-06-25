import { sql } from './src/config/db.js';

async function check() {
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log("Tables:", res.map(r => r.table_name));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
