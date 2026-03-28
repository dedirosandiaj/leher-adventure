const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const inputPath = path.join(__dirname, '../public/images/logo-leher.png');
  const outputPath = path.join(__dirname, '../app/favicon.ico');
  
  try {
    // Generate multiple sizes for favicon.ico
    const sizes = [16, 32, 48, 64];
    const buffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(inputPath)
        .resize(size, size, { fit: 'contain', background: { r: 43, g: 77, b: 89, alpha: 1 } })
        .png()
        .toBuffer();
      buffers.push(buffer);
    }
    
    // For now, just use 32x32 as single favicon
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 43, g: 77, b: 89, alpha: 1 } })
      .png()
      .toFile(outputPath.replace('.ico', '.png'));
    
    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
