import Database from 'better-sqlite3';
import path from 'path';

// Use DATABASE_URL from env or default to local dev.db
const DB_PATH = process.env.DATABASE_URL 
  ? path.resolve(process.cwd(), process.env.DATABASE_URL.replace('file:', ''))
  : path.resolve(process.cwd(), 'prisma/dev.db');

let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    // Ensure tables exist
    _db.exec(`
      CREATE TABLE IF NOT EXISTS Admin (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS Journey (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        year TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Rencana',
        "order" INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS Mountain (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        name TEXT NOT NULL,
        journeyId TEXT NOT NULL,
        FOREIGN KEY (journeyId) REFERENCES Journey(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS TeamMember (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        name TEXT NOT NULL,
        ig TEXT NOT NULL,
        photo TEXT,
        "order" INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS Gallery (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail TEXT,
        "order" INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS HeroSlide (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS HeroText (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        title TEXT NOT NULL DEFAULT 'Jelajahi Alam,',
        subtitle TEXT NOT NULL DEFAULT 'Temukan Jati Diri.',
        description TEXT NOT NULL DEFAULT 'Komunitas pecinta alam yang berdedikasi untuk menjaga kelestarian hutan dan pegunungan Indonesia.'
      );
      CREATE TABLE IF NOT EXISTS About (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        title TEXT NOT NULL DEFAULT 'Tentang Kami',
        paragraph1 TEXT NOT NULL DEFAULT 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia. Kami bukan sekadar kelompok pendaki, melainkan wadah bagi siapa saja yang ingin mengeksplorasi keagungan gunung dengan prinsip etika lingkungan yang kuat.',
        paragraph2 TEXT NOT NULL DEFAULT 'Misi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki (safety climbing), serta aktif dalam kegiatan konservasi alam. Kami percaya bahwa setiap langkah di puncak adalah sebuah pelajaran tentang kerendahan hati dan ketahanan diri.'
      );
    `);
    
    // Migration: Add photo column to TeamMember if not exists
    try {
      const tableInfo = _db.prepare("PRAGMA table_info(TeamMember)").all();
      const hasPhotoColumn = tableInfo.some(col => col.name === 'photo');
      if (!hasPhotoColumn) {
        _db.exec('ALTER TABLE TeamMember ADD COLUMN photo TEXT');
      }
    } catch (err) {
      console.error('Migration error:', err);
    }
  }
  return _db;
}

export const prisma = {
  admin: {
    count: () => getDb().prepare('SELECT COUNT(*) as count FROM Admin').get().count,
    findMany: () => getDb().prepare('SELECT id, username FROM Admin').all(),
    findUnique: ({ where }) => {
      if (where.id) {
        return getDb().prepare('SELECT * FROM Admin WHERE id = ?').get(where.id) || null;
      }
      return getDb().prepare('SELECT * FROM Admin WHERE username = ?').get(where.username) || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO Admin (id, username, password) VALUES (?, ?, ?)').run(id, data.username, data.password);
    },
    update: ({ where, data }) => {
      if (data.password) {
        getDb().prepare('UPDATE Admin SET password = ? WHERE id = ?').run(data.password, where.id);
      }
      if (data.username) {
        getDb().prepare('UPDATE Admin SET username = ? WHERE id = ?').run(data.username, where.id);
      }
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM Admin WHERE id = ?').run(where.id),
  },
  journey: {
    findMany: ({ orderBy, include } = {}) => {
      let query = 'SELECT * FROM Journey';
      if (orderBy?.order) {
        query += ' ORDER BY "order" ASC';
      } else if (orderBy?.year) {
        query += ' ORDER BY year ASC';
      } else {
        query += ' ORDER BY year ASC';
      }
      const journeys = getDb().prepare(query).all();
      if (include?.mountains) {
        return journeys.map(j => ({
          ...j,
          mountains: getDb().prepare('SELECT * FROM Mountain WHERE journeyId = ?').all(j.id)
        }));
      }
      return journeys;
    },
    findUnique: ({ where }) => {
      return getDb().prepare('SELECT * FROM Journey WHERE id = ?').get(where.id) || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO Journey (id, year, status, "order") VALUES (?, ?, ?, ?)').run(id, data.year, data.status || 'Rencana', data.order || 0);
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.year !== undefined) { sets.push('year = ?'); vals.push(data.year); }
      if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); }
      if (data.order !== undefined) { sets.push('"order" = ?'); vals.push(data.order); }
      vals.push(where.id);
      getDb().prepare(`UPDATE Journey SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM Journey WHERE id = ?').run(where.id),
  },
  mountain: {
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO Mountain (id, name, journeyId) VALUES (?, ?, ?)').run(id, data.name, data.journeyId);
    },
    update: ({ where, data }) => {
      getDb().prepare('UPDATE Mountain SET name = ? WHERE id = ?').run(data.name, where.id);
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM Mountain WHERE id = ?').run(where.id),
  },
  teamMember: {
    findMany: () => getDb().prepare('SELECT * FROM TeamMember ORDER BY "order" ASC').all(),
    findUnique: ({ where }) => {
      return getDb().prepare('SELECT * FROM TeamMember WHERE id = ?').get(where.id) || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO TeamMember (id, name, ig, photo, "order") VALUES (?, ?, ?, ?, ?)').run(id, data.name, data.ig, data.photo || null, data.order || 0);
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
      if (data.ig !== undefined) { sets.push('ig = ?'); vals.push(data.ig); }
      if (data.photo !== undefined) { sets.push('photo = ?'); vals.push(data.photo); }
      if (data.order !== undefined) { sets.push('"order" = ?'); vals.push(data.order); }
      vals.push(where.id);
      getDb().prepare(`UPDATE TeamMember SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM TeamMember WHERE id = ?').run(where.id),
  },
  gallery: {
    findMany: () => getDb().prepare('SELECT * FROM Gallery ORDER BY "order" ASC').all(),
    findUnique: ({ where }) => {
      return getDb().prepare('SELECT * FROM Gallery WHERE id = ?').get(where.id) || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO Gallery (id, type, url, thumbnail, "order") VALUES (?, ?, ?, ?, ?)').run(id, data.type, data.url, data.thumbnail || null, data.order || 0);
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.type !== undefined) { sets.push('type = ?'); vals.push(data.type); }
      if (data.url !== undefined) { sets.push('url = ?'); vals.push(data.url); }
      if (data.thumbnail !== undefined) { sets.push('thumbnail = ?'); vals.push(data.thumbnail); }
      if (data.order !== undefined) { sets.push('"order" = ?'); vals.push(data.order); }
      vals.push(where.id);
      getDb().prepare(`UPDATE Gallery SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM Gallery WHERE id = ?').run(where.id),
  },
  heroSlide: {
    findMany: ({ orderBy } = {}) => {
      let query = 'SELECT * FROM HeroSlide';
      if (orderBy?.order === 'desc') {
        query += ' ORDER BY "order" DESC';
      } else {
        query += ' ORDER BY "order" ASC';
      }
      return getDb().prepare(query).all();
    },
    findUnique: ({ where }) => {
      return getDb().prepare('SELECT * FROM HeroSlide WHERE id = ?').get(where.id) || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO HeroSlide (id, url, "order") VALUES (?, ?, ?)').run(id, data.url, data.order || 0);
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.url !== undefined) { sets.push('url = ?'); vals.push(data.url); }
      if (data.order !== undefined) { sets.push('"order" = ?'); vals.push(data.order); }
      vals.push(where.id);
      getDb().prepare(`UPDATE HeroSlide SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
    delete: ({ where }) => getDb().prepare('DELETE FROM HeroSlide WHERE id = ?').run(where.id),
  },
  heroText: {
    findFirst: () => {
      return getDb().prepare('SELECT * FROM HeroText LIMIT 1').get() || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO HeroText (id, title, subtitle, description) VALUES (?, ?, ?, ?)').run(
        id, 
        data.title || 'Jelajahi Alam,',
        data.subtitle || 'Temukan Jati Diri.',
        data.description || 'Komunitas pecinta alam yang berdedikasi untuk menjaga kelestarian hutan dan pegunungan Indonesia.'
      );
      return { id, ...data };
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
      if (data.subtitle !== undefined) { sets.push('subtitle = ?'); vals.push(data.subtitle); }
      if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }
      vals.push(where.id);
      getDb().prepare(`UPDATE HeroText SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
  },
  about: {
    findFirst: () => {
      return getDb().prepare('SELECT * FROM About LIMIT 1').get() || null;
    },
    create: ({ data }) => {
      const id = Math.random().toString(36).substring(2, 18);
      getDb().prepare('INSERT INTO About (id, title, paragraph1, paragraph2) VALUES (?, ?, ?, ?)').run(
        id, 
        data.title || 'Tentang Kami',
        data.paragraph1 || 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia.',
        data.paragraph2 || 'Misi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki.'
      );
      return { id, ...data };
    },
    update: ({ where, data }) => {
      const sets = [];
      const vals = [];
      if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
      if (data.paragraph1 !== undefined) { sets.push('paragraph1 = ?'); vals.push(data.paragraph1); }
      if (data.paragraph2 !== undefined) { sets.push('paragraph2 = ?'); vals.push(data.paragraph2); }
      vals.push(where.id);
      getDb().prepare(`UPDATE About SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    },
  },
};
