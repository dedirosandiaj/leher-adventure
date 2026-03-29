import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let _db = null;

async function getDb() {
  if (!_db) {
    _db = {
      query: (text, params) => pool.query(text, params),
      exec: async (sql) => {
        // Split multiple statements and execute sequentially
        const statements = sql.split(';').filter(s => s.trim());
        for (const stmt of statements) {
          await pool.query(stmt);
        }
      },
      prepare: (sql) => ({
        get: async (params) => {
          const result = await pool.query(sql, params);
          return result.rows[0] || null;
        },
        all: async (params) => {
          const result = await pool.query(sql, params);
          return result.rows;
        },
        run: async (params) => {
          const result = await pool.query(sql, params);
          return { lastInsertRowid: result.rows[0]?.id };
        },
      }),
    };
    
    // Ensure tables exist
    await initTables();
  }
  return _db;
}

async function initTables() {
  const client = await pool.connect();
  try {
    // Admin table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Admin (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // HeroSlide table
    await client.query(`
      CREATE TABLE IF NOT EXISTS HeroSlide (
        id SERIAL PRIMARY KEY,
        image TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // HeroText table
    await client.query(`
      CREATE TABLE IF NOT EXISTS HeroText (
        id SERIAL PRIMARY KEY,
        title_line1 TEXT DEFAULT 'Selamat Datang di',
        title_line2 TEXT DEFAULT 'Leher Adventure',
        description TEXT DEFAULT 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // About table
    await client.query(`
      CREATE TABLE IF NOT EXISTS About (
        id SERIAL PRIMARY KEY,
        content TEXT DEFAULT 'Leher Adventure adalah komunitas petualangan...',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
    `);
    
    // Add type column if not exists (migration)
    try {
      await client.query('ALTER TABLE Gallery ADD COLUMN IF NOT EXISTS type TEXT DEFAULT \'image\'');
      await client.query('ALTER TABLE Gallery ADD COLUMN IF NOT EXISTS thumbnail TEXT');
    } catch (err) {
      // Columns might already exist
    }

    // Mountain table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Mountain (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER DEFAULT 2024,
        status TEXT DEFAULT 'Rencana'
      )
    `);

    // TeamMember table
    await client.query(`
      CREATE TABLE IF NOT EXISTS TeamMember (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        ig TEXT NOT NULL,
        photo TEXT
      )
    `);

    console.log('PostgreSQL tables initialized');
  } catch (err) {
    console.error('Error initializing tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Helper functions for CRUD
export const prisma = {
  admin: {
    count: async () => {
      const db = await getDb();
      const result = await db.query('SELECT COUNT(*) FROM Admin');
      return parseInt(result.rows[0].count);
    },
    findUnique: async ({ where }) => {
      const db = await getDb();
      let sql = 'SELECT * FROM Admin';
      const params = [];
      if (where.id) {
        sql += ' WHERE id = $1';
        params.push(where.id);
      } else if (where.username) {
        sql += ' WHERE username = $1';
        params.push(where.username);
      }
      const result = await db.query(sql, params);
      return result.rows[0] || null;
    },
    findMany: async () => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM Admin ORDER BY id');
      return result.rows;
    },
    create: async ({ data }) => {
      const db = await getDb();
      const result = await db.query(
        'INSERT INTO Admin (username, password, role) VALUES ($1, $2, $3) RETURNING *',
        [data.username, data.password, data.role || 'member']
      );
      return result.rows[0];
    },
    delete: async ({ where }) => {
      const db = await getDb();
      await db.query('DELETE FROM Admin WHERE id = $1', [where.id]);
      return { id: where.id };
    },
  },
  
  heroSlide: {
    findMany: async ({ orderBy } = {}) => {
      const db = await getDb();
      let sql = 'SELECT * FROM HeroSlide';
      if (orderBy?.order) {
        sql += ` ORDER BY "order" ${orderBy.order === 'desc' ? 'DESC' : 'ASC'}`;
      }
      const result = await db.query(sql);
      return result.rows;
    },
    findUnique: async ({ where }) => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM HeroSlide WHERE id = $1', [where.id]);
      return result.rows[0] || null;
    },
    create: async ({ data }) => {
      const db = await getDb();
      const result = await db.query(
        'INSERT INTO HeroSlide (image, "order") VALUES ($1, $2) RETURNING *',
        [data.image, data.order || 0]
      );
      return result.rows[0];
    },
    delete: async ({ where }) => {
      const db = await getDb();
      const slide = await db.query('SELECT * FROM HeroSlide WHERE id = $1', [where.id]);
      await db.query('DELETE FROM HeroSlide WHERE id = $1', [where.id]);
      return slide.rows[0];
    },
  },
  
  heroText: {
    findFirst: async () => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM HeroText LIMIT 1');
      if (result.rows.length === 0) {
        // Create default
        const insert = await db.query(
          'INSERT INTO HeroText DEFAULT VALUES RETURNING *'
        );
        return insert.rows[0];
      }
      return result.rows[0];
    },
    update: async ({ where, data }) => {
      const db = await getDb();
      const setClause = Object.keys(data).map((key, i) => `"${key}" = $${i + 1}`).join(', ');
      const values = Object.values(data);
      const result = await db.query(
        `UPDATE HeroText SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`,
        [...values, where.id]
      );
      return result.rows[0];
    },
  },
  
  about: {
    findFirst: async () => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM About LIMIT 1');
      if (result.rows.length === 0) {
        const insert = await db.query('INSERT INTO About DEFAULT VALUES RETURNING *');
        return insert.rows[0];
      }
      return result.rows[0];
    },
    update: async ({ where, data }) => {
      const db = await getDb();
      const result = await db.query(
        'UPDATE About SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [data.content, where.id]
      );
      return result.rows[0];
    },
  },
  
  gallery: {
    findMany: async ({ orderBy } = {}) => {
      const db = await getDb();
      let sql = 'SELECT * FROM Gallery';
      if (orderBy?.order) {
        sql += ` ORDER BY "order" ${orderBy.order === 'desc' ? 'DESC' : 'ASC'}`;
      }
      const result = await db.query(sql);
      return result.rows;
    },
    findUnique: async ({ where }) => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM Gallery WHERE id = $1', [where.id]);
      return result.rows[0] || null;
    },
    create: async ({ data }) => {
      const db = await getDb();
      const result = await db.query(
        'INSERT INTO Gallery (type, title, image, video_url, thumbnail, "order") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.type || 'image', data.title, data.image, data.video_url || null, data.thumbnail || null, data.order || 0]
      );
      return result.rows[0];
    },
    delete: async ({ where }) => {
      const db = await getDb();
      const item = await db.query('SELECT * FROM Gallery WHERE id = $1', [where.id]);
      await db.query('DELETE FROM Gallery WHERE id = $1', [where.id]);
      return item.rows[0];
    },
  },
  
  mountain: {
    findMany: async ({ where } = {}) => {
      const db = await getDb();
      let sql = 'SELECT * FROM Mountain';
      const params = [];
      if (where?.status) {
        sql += ' WHERE status = $1';
        params.push(where.status);
      }
      sql += ' ORDER BY year DESC, name ASC';
      const result = await db.query(sql, params);
      return result.rows;
    },
    create: async ({ data }) => {
      const db = await getDb();
      const result = await db.query(
        'INSERT INTO Mountain (name, year, status) VALUES ($1, $2, $3) RETURNING *',
        [data.name, data.year, data.status || 'Rencana']
      );
      return result.rows[0];
    },
    update: async ({ where, data }) => {
      const db = await getDb();
      // Build dynamic query based on provided fields
      const fields = [];
      const values = [];
      let paramIndex = 1;
      
      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.year !== undefined) {
        fields.push(`year = $${paramIndex++}`);
        values.push(data.year);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(data.status);
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(where.id);
      const result = await db.query(
        `UPDATE Mountain SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0];
    },
    delete: async ({ where }) => {
      const db = await getDb();
      await db.query('DELETE FROM Mountain WHERE id = $1', [where.id]);
      return { id: where.id };
    },
  },
  
  teamMember: {
    findMany: async () => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM TeamMember');
      return result.rows;
    },
    findFirst: async ({ where } = {}) => {
      const db = await getDb();
      let sql = 'SELECT * FROM TeamMember';
      const params = [];
      if (where?.ig) {
        sql += ' WHERE ig = $1';
        params.push(where.ig);
      }
      sql += ' LIMIT 1';
      const result = await db.query(sql, params);
      return result.rows[0] || null;
    },
    findUnique: async ({ where }) => {
      const db = await getDb();
      const result = await db.query('SELECT * FROM TeamMember WHERE id = $1', [where.id]);
      return result.rows[0] || null;
    },
    create: async ({ data }) => {
      const db = await getDb();
      const result = await db.query(
        'INSERT INTO TeamMember (name, ig, photo) VALUES ($1, $2, $3) RETURNING *',
        [data.name, data.ig, data.photo || null]
      );
      return result.rows[0];
    },
    update: async ({ where, data }) => {
      const db = await getDb();
      const result = await db.query(
        'UPDATE TeamMember SET name = $1, ig = $2, photo = $3 WHERE id = $4 RETURNING *',
        [data.name, data.ig, data.photo, where.id]
      );
      return result.rows[0];
    },
    delete: async ({ where }) => {
      const db = await getDb();
      const member = await db.query('SELECT * FROM TeamMember WHERE id = $1', [where.id]);
      await db.query('DELETE FROM TeamMember WHERE id = $1', [where.id]);
      return member.rows[0];
    },
  },
};

export { getDb };
