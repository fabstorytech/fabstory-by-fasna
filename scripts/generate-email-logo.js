const sharp = require('sharp');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'jwter84c',
  api_key: '568588525992717',
  api_secret: 'PyoHDASsIEhvLoO3VRLCPsGTK8Y'
});

async function main() {
  console.log('Reading public/logo.png...');
  // 1. Trim whitespace from public/logo.png
  const trimmed = await sharp('public/logo.png')
    .trim({ threshold: 20 })
    .toBuffer({ resolveWithObject: true });

  console.log('Trimmed dimensions:', trimmed.info.width, 'x', trimmed.info.height);

  // We want to fit this trimmed logo inside a 320x320 circular medallion
  // Inside a circle of radius 156 (diameter 312), a safe bounding box is:
  // Width 216, height proportional (around 126px)
  const targetW = 216;
  const targetH = Math.round(targetW * (trimmed.info.height / trimmed.info.width));
  console.log('Target logo size inside medallion:', targetW, 'x', targetH);

  const resizedLogo = await sharp(trimmed.data)
    .resize(targetW, targetH, { fit: 'inside' })
    .png()
    .toBuffer({ resolveWithObject: true });

  // 2. High-precision SVG circular medallion with dual luxury gold rings
  const circleSvg = Buffer.from(
    `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <!-- Crisp pure white circle background -->
      <circle cx="160" cy="160" r="156" fill="#FFFFFF" />
      <!-- Primary refined gold ring (#C7A66A) -->
      <circle cx="160" cy="160" r="154" fill="none" stroke="#C7A66A" stroke-width="4.5" />
      <!-- Subtle inner hairline accent ring -->
      <circle cx="160" cy="160" r="148" fill="none" stroke="#E9DCBE" stroke-width="1.2" />
    </svg>`
  );

  // 3. Base transparent 320x320 canvas
  const medallionBase = await sharp({
    create: {
      width: 320,
      height: 320,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: circleSvg, top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  // 4. Composite the perfectly sized logo in the center
  const topOffset = Math.round((320 - resizedLogo.info.height) / 2);
  const leftOffset = Math.round((320 - resizedLogo.info.width) / 2);

  const finalMedallion = await sharp(medallionBase)
    .composite([
      { input: resizedLogo.data, top: topOffset, left: leftOffset }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('public/email-brand-logo.png', finalMedallion);
  console.log('Saved public/email-brand-logo.png successfully!');

  // 5. Upload to Cloudinary
  console.log('Uploading to Cloudinary...');
  const uploadResult = await cloudinary.uploader.upload('public/email-brand-logo.png', {
    folder: 'fabstory-branding',
    public_id: 'fabstory_email_logo_perfect',
    overwrite: true,
    invalidate: true
  });

  console.log('Uploaded successfully! URL:', uploadResult.secure_url);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
