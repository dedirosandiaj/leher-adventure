-- Create equipmentitem table
CREATE TABLE IF NOT EXISTS equipmentitem (
  id SERIAL PRIMARY KEY,
  category VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR,
  required BOOLEAN DEFAULT false
);

-- Create memberequipment table
CREATE TABLE IF NOT EXISTS memberequipment (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  checked BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, item_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_memberequipment_member_id ON memberequipment(member_id);
CREATE INDEX IF NOT EXISTS idx_memberequipment_item_id ON memberequipment(item_id);
CREATE INDEX IF NOT EXISTS idx_equipmentitem_category ON equipmentitem(category);
