-- Seed data for Leher Adventure Database
-- Run with: psql $DATABASE_URL -f prisma/seed.sql

-- 1. Insert Admin User
INSERT INTO "User" (id, username, password, email, name, role, "isTeam", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$YourHashedPasswordHere',
  'admin@leher-adventure.com',
  'Administrator',
  'ADMIN',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- 2. Insert About (if empty)
INSERT INTO "About" (id, content, "updatedAt")
SELECT 
  gen_random_uuid(),
  'Leher Adventure adalah komunitas petualangan yang didirikan dengan semangat eksplorasi dan kecintaan terhadap alam Indonesia. Kami percaya bahwa setiap perjalanan adalah kesempatan untuk bertumbuh, belajar, dan menciptakan kenangan tak terlupakan.',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "About");

-- 3. Insert HeroText (if empty)
INSERT INTO "HeroText" (id, "titleLine1", "titleLine2", description, "updatedAt")
SELECT 
  gen_random_uuid(),
  'Selamat Datang di',
  'Leher Adventure',
  'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HeroText");

-- 4. Insert Equipment Categories
INSERT INTO "EquipmentCategory" (id, name, "order", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Pakaian', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Sepatu & Sandal', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tenda & Shelter', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tidur', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Penerangan', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Navigasi', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'P3K & Safety', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Makanan & Minum', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Perlengkapan Pribadi', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Equipment Items (for Pakaian category)
DO $$
DECLARE
  pakaian_id UUID;
BEGIN
  SELECT id INTO pakaian_id FROM "EquipmentCategory" WHERE name = 'Pakaian';
  
  IF pakaian_id IS NOT NULL THEN
    INSERT INTO "EquipmentItem" (id, "categoryId", name, description, required, "createdAt", "updatedAt") VALUES
      (gen_random_uuid(), pakaian_id, 'Jacket Waterproof', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), pakaian_id, 'Quick Dry T-Shirt (2-3 pcs)', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), pakaian_id, 'Celana Panjang Outdoor', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), pakaian_id, 'Kaos Kaki Tebal (2-3 pasang)', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), pakaian_id, 'Kupluk/Syal', NULL, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 6. Insert Mountains
INSERT INTO "Mountain" (id, name, height, location, difficulty, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Gunung Rinjani', 3726, 'Lombok, NTB', 'Hard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Gunung Semeru', 3676, 'Lumajang, Jatim', 'Hard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Gunung Bromo', 2329, 'Probolinggo, Jatim', 'Easy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
