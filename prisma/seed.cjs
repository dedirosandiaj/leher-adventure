const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Insert Admin User
    await client.query(`
      INSERT INTO "User" (id, username, password, email, name, role, "isTeam", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'admin', '$2a$10$YourHashedPasswordHere', 'admin@leher-adventure.com', 'Administrator', 'ADMIN', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('✅ Admin user created');

    // 2. Insert About
    await client.query(`
      INSERT INTO "About" (id, content, "updatedAt")
      SELECT gen_random_uuid(), 'Leher Adventure adalah komunitas petualangan yang didirikan dengan semangat eksplorasi dan kecintaan terhadap alam Indonesia. Kami percaya bahwa setiap perjalanan adalah kesempatan untuk bertumbuh, belajar, dan menciptakan kenangan tak terlupakan.', CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM "About")
    `);
    console.log('✅ About content created');

    // 3. Insert HeroText
    await client.query(`
      INSERT INTO "HeroText" (id, "titleLine1", "titleLine2", description, "updatedAt")
      SELECT gen_random_uuid(), 'Selamat Datang di', 'Leher Adventure', 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.', CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM "HeroText")
    `);
    console.log('✅ Hero text created');

    // 4. Insert Equipment Categories
    const categories = [
      'Pakaian', 'Sepatu & Sandal', 'Tenda & Shelter', 'Tidur',
      'Penerangan', 'Navigasi', 'P3K & Safety', 'Makanan & Minum', 'Perlengkapan Pribadi'
    ];
    
    for (let i = 0; i < categories.length; i++) {
      await client.query(`
        INSERT INTO "EquipmentCategory" (id, name, "order", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (name) DO NOTHING
      `, [categories[i], i + 1]);
    }
    console.log('✅ Equipment categories created');

    // 5. Insert Equipment Items for Pakaian
    const pakaianResult = await client.query('SELECT id FROM "EquipmentCategory" WHERE name = $1', ['Pakaian']);
    if (pakaianResult.rows.length > 0) {
      const pakaianId = pakaianResult.rows[0].id;
      const items = [
        { name: 'Jacket Waterproof', required: true },
        { name: 'Quick Dry T-Shirt (2-3 pcs)', required: true },
        { name: 'Celana Panjang Outdoor', required: true },
        { name: 'Kaos Kaki Tebal (2-3 pasang)', required: true },
        { name: 'Kupluk/Syal', required: false },
      ];
      
      for (const item of items) {
        await client.query(`
          INSERT INTO "EquipmentItem" (id, "categoryId", name, required, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `, [pakaianId, item.name, item.required]);
      }
      console.log('✅ Equipment items created');
    }

    // 6. Insert Mountains
    const mountains = [
      { name: 'Gunung Rinjani', height: 3726, location: 'Lombok, NTB', difficulty: 'Hard' },
      { name: 'Gunung Semeru', height: 3676, location: 'Lumajang, Jatim', difficulty: 'Hard' },
      { name: 'Gunung Bromo', height: 2329, location: 'Probolinggo, Jatim', difficulty: 'Easy' },
    ];
    
    for (const m of mountains) {
      await client.query(`
        INSERT INTO "Mountain" (id, name, height, location, difficulty, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
      `, [m.name, m.height, m.location, m.difficulty]);
    }
    console.log('✅ Mountains created');

    console.log('🎉 Seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
