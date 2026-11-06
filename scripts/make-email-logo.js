const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'jwter84c',
  api_key: '568588525992717',
  api_secret: 'PyoHDASsIEhvLoO3VRLCPsGTK8Y'
});

async function run() {
  const { data, info } = await sharp('public/logo.png').raw().toBuffer({ resolveWithObject: true });

  const cx = Math.floor(info.width / 2);
  const cy = Math.floor(info.height / 2);

  let top = 0;
  let bottom = info.height;

  for (let y = 0; y < cy; y++) {
    const idx = (y * info.width + cx) * info.channels;
    if (data[idx] < 235 || data[idx + 1] < 235 || data[idx + 2] < 235) {
      top = y;
      break;
    }
  }

  for (let y = info.height - 1; y > cy; y--) {
    const idx = (y * info.width + cx) * info.channels;
    if (data[idx] < 235 || data[idx + 1] < 235 || data[idx + 2] < 235) {
      bottom = y;
      break;
    }
  }

  const diameter = bottom - top;
  console.log('Detected emblem diameter:', diameter, 'top:', top, 'bottom:', bottom);

  // Exact bounds of the circular emblem
  const size = diameter + 8;
  const left = Math.round(cx - size / 2);
  const cropTop = Math.round(top - 4);

  // Crop exact circle
  const cropped = await sharp('public/logo.png')
    .extract({ left, top: cropTop, width: size, height: size })
    .resize(320, 320)
    .toBuffer();

  // Create clean circular mask with gold ring directly on the PNG
  const maskSvg = Buffer.from(
    '<svg width="320" height="320">' +
    '<circle cx="160" cy="160" r="158" fill="white" />' +
    '</svg>'
  );

  const ringSvg = Buffer.from(
    '<svg width="320" height="320">' +
    '<circle cx="160" cy="160" r="156" fill="none" stroke="#C7A66A" stroke-width="5"/>' +
    '</svg>'
  );

  const circularLogo = await sharp(cropped)
    .composite([
      { input: maskSvg, blend: 'dest-in' }
    ])
    .png()
    .toBuffer();

  const finalLogo = await sharp(circularLogo)
    .composite([
      { input: ringSvg }
    ])
    .png()
    .toBuffer();

  await sharp(finalLogo).toFile('public/email-brand-logo.png');
  console.log('Successfully created public/email-brand-logo.png');

  // Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload('public/email-brand-logo.png', {
    folder: 'fabstory-branding',
    public_id: 'fabstory_email_logo_perfect',
    overwrite: true
  });

  console.log('PERFECT_CLOUDINARY_URL:', uploadResult.secure_url);
}

run().catch(console.error);
