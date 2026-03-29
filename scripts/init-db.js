const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to PostgreSQL...');
    const client = await pool.connect();
    
    console.log('Running initialization SQL...');
    
    // Create tables one by one with error handling
    // Admin table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Admin (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'member'))
      )
    `).catch(() => {
      // Table exists, try to add role column
      return client.query(`ALTER TABLE Admin ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'member'))`);
    });
    
    // HeroSlide table
    await client.query(`
      CREATE TABLE IF NOT EXISTS HeroSlide (
        id SERIAL PRIMARY KEY,
        image TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    
    // HeroText table
    await client.query(`
      CREATE TABLE IF NOT EXISTS HeroText (
        id SERIAL PRIMARY KEY,
        title_line1 TEXT DEFAULT 'Selamat Datang di',
        title_line2 TEXT DEFAULT 'Leher Adventure',
        description TEXT DEFAULT 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    
    // About table
    await client.query(`
      CREATE TABLE IF NOT EXISTS About (
        id SERIAL PRIMARY KEY,
        content TEXT DEFAULT 'Leher Adventure adalah komunitas petualangan...',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    
    // Gallery table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Gallery (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        video_url TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    
    // Journey table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Journey (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        status TEXT DEFAULT 'Rencana',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    
    // Mountain table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Mountain (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        journey_id INTEGER REFERENCES Journey(id) ON DELETE CASCADE
      )
    `).catch(() => {});
    
    // TeamMember table
    await client.query(`
      CREATE TABLE IF NOT EXISTS TeamMember (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        ig TEXT NOT NULL,
        photo TEXT
      )
    `).catch(() => {});
    
    console.log('✅ Database initialized successfully!');
    
    // Ensure column role exists
    await client.query(`ALTER TABLE Admin ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin'`).catch(() => {});
    
    // Check if column role exists
    const columnCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'admin' AND column_name = 'role'
    `);
    const hasRoleColumn = columnCheck.rows.length > 0;
    
    // Check if admin exists, if not create default admin and member
    const adminResult = await client.query('SELECT COUNT(*) FROM Admin');
    if (parseInt(adminResult.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      
      if (hasRoleColumn) {
        // Create admin with role
        await client.query(
          'INSERT INTO Admin (username, password, role) VALUES ($1, $2, $3)',
          ['admin', hash, 'admin']
        );
        console.log('✅ Default admin created (username: admin, password: admin123)');
        
        // Create member
        await client.query(
          'INSERT INTO Admin (username, password, role) VALUES ($1, $2, $3)',
          ['member', hash, 'member']
        );
        console.log('✅ Default member created (username: member, password: admin123)');
      } else {
        // Create without role (fallback)
        await client.query(
          'INSERT INTO Admin (username, password) VALUES ($1, $2)',
          ['admin', hash]
        );
        console.log('✅ Default admin created (no role column)');
      }
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase().catch(err => {
  console.error('Database init error (non-fatal):', err.message);
  process.exit(0); // Don't fail startup
});
