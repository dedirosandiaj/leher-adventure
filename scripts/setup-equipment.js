const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupEquipment() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting equipment tables setup...');
    
    // Read migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250328_add_equipment_tables/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Read seed SQL
    const seedPath = path.join(__dirname, '../prisma/migrations/20250328_add_equipment_tables/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Run migration
    console.log('📊 Creating tables...');
    await client.query(migrationSQL);
    console.log('✅ Tables created successfully');
    
    // Check if data already exists
    const checkResult = await client.query('SELECT COUNT(*) FROM equipmentitem');
    const count = parseInt(checkResult.rows[0].count);
    
    if (count === 0) {
      // Run seed
      console.log('🌱 Seeding equipment items...');
      await client.query(seedSQL);
      console.log('✅ Seed data inserted successfully');
    } else {
      console.log(`ℹ️  Equipment items already exist (${count} items), skipping seed`);
    }
    
    console.log('🎉 Setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupEquipment();
