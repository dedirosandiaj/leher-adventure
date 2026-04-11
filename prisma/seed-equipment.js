const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const equipmentData = [
  // Tas & Carrier
  { category: 'Tas & Carrier', name: 'Carrier 60-80L', description: 'Untuk membawa semua perlengkapan', required: true },
  { category: 'Tas & Carrier', name: 'Daypack 20-30L', description: 'Untuk summit attack', required: true },
  { category: 'Tas & Carrier', name: 'Dry Bag', description: 'Melindungi barang dari air', required: false },
  
  // Tidur & Shelter
  { category: 'Tidur & Shelter', name: 'Tenda (Double Layer)', description: 'Tahan angin dan hujan', required: true },
  { category: 'Tidur & Shelter', name: 'Sleeping Bag (-10°C to -15°C)', description: 'Sesuaikan suhu gunung', required: true },
  { category: 'Tidur & Shelter', name: 'Sleeping Pad/Matras', description: 'Isolasi dari dingin tanah', required: true },
  
  // Pakaian
  { category: 'Pakaian', name: 'Base Layer (Dry-fit)', description: 'Menyerap keringat', required: true },
  { category: 'Pakaian', name: 'Mid Layer (Fleece)', description: 'Menjaga suhu tubuh', required: true },
  { category: 'Pakaian', name: 'Outer Layer (Jaket Waterproof)', description: 'Tahan angin & hujan', required: true },
  { category: 'Pakaian', name: 'Celana Outdoor', description: 'Cepat kering & nyaman', required: true },
  { category: 'Pakaian', name: 'Sarung Tangan', description: 'Melindungi dari dingin', required: true },
  { category: 'Pakaian', name: 'Kupluk/Topi', description: 'Menjaga kepala tetap hangat', required: true },
  
  // Kaki
  { category: 'Kaki', name: 'Sepatu Gunung (Mid/High Cut)', description: 'Ankle support & waterproof', required: true },
  { category: 'Kaki', name: 'Gaiters', description: 'Melindungi dari kerikil & salju', required: false },
  { category: 'Kaki', name: 'Sandal Gunung', description: 'Untuk di camp', required: false },
  
  // Penerangan & Navigasi
  { category: 'Penerangan & Navigasi', name: 'Headlamp + Baterai Cadangan', description: 'Penerangan hands-free', required: true },
  { category: 'Penerangan & Navigasi', name: 'GPS/Compass', description: 'Navigasi darurat', required: true },
  
  // Makanan & Minum
  { category: 'Makanan & Minum', name: 'Kompor Portable + Gas', description: 'Memasak di camp', required: true },
  { category: 'Makanan & Minum', name: 'Nesting/Cookset', description: 'Peralatan memasak', required: true },
  { category: 'Makanan & Minum', name: 'Water Bottle/Hydration Bladder', description: 'Minimal 2L kapasitas', required: true },
  { category: 'Makanan & Minum', name: 'Water Purification Tablets', description: 'Sterilisasi air', required: false },
  { category: 'Makanan & Minum', name: 'Makanan Instan/Energi', description: 'Mie, coklat, kacang, dll', required: true },
  
  // Kesehatan & Keselamatan
  { category: 'Kesehatan & Keselamatan', name: 'First Aid Kit (P3K)', description: 'Obat-obatan dasar', required: true },
  { category: 'Kesehatan & Keselamatan', name: 'Sunscreen & Lip Balm', description: 'Proteksi UV', required: true },
  { category: 'Kesehatan & Keselamatan', name: 'Obat Pribadi', description: 'Sesuai kondisi kesehatan', required: true },
  { category: 'Kesehatan & Keselamatan', name: 'Survival Blanket', description: 'Darurat hipotermia', required: false },
  
  // Peralatan Tambahan
  { category: 'Peralatan Tambahan', name: 'Trekking Pole', description: 'Mengurangi beban kaki', required: false },
  { category: 'Peralatan Tambahan', name: 'Rain Cover/Cover Bag', description: 'Pelindung hujan untuk carrier', required: true },
  { category: 'Peralatan Tambahan', name: 'Trash Bag', description: 'Prinsip Leave No Trace', required: true },
  { category: 'Peralatan Tambahan', name: 'Power Bank', description: 'Cadangan daya', required: true },
  { category: 'Peralatan Tambahan', name: 'Kamera/Action Cam', description: 'Dokumentasi', required: false },
];

async function main() {
  console.log('Start seeding equipment items...');
  
  // Clear existing data
  await prisma.userEquipment.deleteMany();
  await prisma.equipmentItem.deleteMany();
  
  // Insert new data
  for (const item of equipmentData) {
    await prisma.equipmentItem.create({
      data: item
    });
  }
  
  console.log(`Seeded ${equipmentData.length} equipment items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
