import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
});

const apiKey = env.BREVO_API_KEY;
const senderEmail = env.BREVO_SENDER_EMAIL || 'hello@fabstorybyfasna.com';
const senderName = env.BREVO_SENDER_NAME || 'Fabstory by Fasna';
const targetEmail = process.argv[2] || env.ADMIN_NOTIFICATION_EMAIL || senderEmail;

console.log('--- Testing Brevo Transactional Email ---');
console.log('API Key Present:', Boolean(apiKey && !apiKey.includes('placeholder')));
console.log('Sender:', `${senderName} <${senderEmail}>`);
console.log('Recipient:', targetEmail);

if (!apiKey || apiKey.includes('placeholder')) {
  console.error('\n❌ ERROR: BREVO_API_KEY in .env.local is missing or has a placeholder value.');
  process.exit(1);
}

const payload = {
  sender: { name: senderName, email: senderEmail },
  to: [{ email: targetEmail, name: 'Test User' }],
  subject: 'Fabstory Brevo Test Email',
  htmlContent: '<h2>Brevo is working!</h2><p>Your transactional email setup is completely verified.</p>',
};

fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'api-key': apiKey,
  },
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('\n❌ Brevo API Error:', res.status, data);
    } else {
      console.log('\n✅ SUCCESS! Email sent successfully.');
      console.log('Message ID:', data?.messageId);
      console.log(`Check your inbox at: ${targetEmail}`);
    }
  })
  .catch((err) => {
    console.error('\n❌ Network error:', err.message);
  });
