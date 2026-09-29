import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

// In-memory resilient fallback cache for OTPs
interface MemoryOtpRecord {
  hash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  used: boolean;
}

const memoryOtpStore = new Map<string, MemoryOtpRecord>();

function hashOtp(email: string, otp: string): string {
  const secretSalt = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fabstory-otp-secret-salt';
  return crypto
    .createHash('sha256')
    .update(`${email.trim().toLowerCase()}:${otp.trim()}:${secretSalt}`)
    .digest('hex');
}

/**
 * Generates a cryptographically random 6-digit numeric OTP,
 * hashes it, enforces rate limiting, and saves it.
 */
export async function createPasswordResetOtp(email: string): Promise<{
  success: boolean;
  otp?: string;
  error?: string;
  cooldownRemaining?: number;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();

  // 1. Check rate limit / resend cooldown in memory
  const existingMemory = memoryOtpStore.get(cleanEmail);
  if (existingMemory && !existingMemory.used) {
    const elapsedSeconds = Math.floor((now - existingMemory.createdAt) / 1000);
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      return {
        success: false,
        cooldownRemaining: RESEND_COOLDOWN_SECONDS - elapsedSeconds,
        error: `Please wait ${RESEND_COOLDOWN_SECONDS - elapsedSeconds}s before requesting a new code.`,
      };
    }
  }

  // 2. Generate secure 6-digit numeric OTP
  const otpNumber = crypto.randomInt(100000, 1000000);
  const otp = otpNumber.toString();
  const hashed = hashOtp(cleanEmail, otp);
  const expiresAt = now + OTP_EXPIRY_MINUTES * 60 * 1000;

  // 3. Save to in-memory store
  memoryOtpStore.set(cleanEmail, {
    hash: hashed,
    expiresAt,
    attempts: 0,
    createdAt: now,
    used: false,
  });

  // 4. Also persist to Supabase password_reset_otps table if available
  try {
    await supabase.from('password_reset_otps').insert([
      {
        email: cleanEmail,
        otp_hash: hashed,
        expires_at: new Date(expiresAt).toISOString(),
        attempts: 0,
        used: false,
      },
    ]);
  } catch (err) {
    // Non-fatal, memory store guarantees availability
  }

  return {
    success: true,
    otp, // Returned server-side to immediately pass to sendBrevoEmail (never logged or sent to client)
  };
}

/**
 * Validates the entered OTP against stored hash, checks expiry,
 * increments attempt counters, and invalidates immediately if valid.
 */
export async function verifyAndInvalidateOtp(
  email: string,
  enteredOtp: string
): Promise<{ valid: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = enteredOtp.trim();
  const now = Date.now();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return { valid: false, error: 'Please enter a valid 6-digit verification code.' };
  }

  // 1. Check in-memory store first
  const memoryRecord = memoryOtpStore.get(cleanEmail);
  const expectedHash = hashOtp(cleanEmail, cleanOtp);

  if (memoryRecord) {
    if (memoryRecord.used) {
      return { valid: false, error: 'This verification code has already been used.' };
    }

    if (now > memoryRecord.expiresAt) {
      memoryOtpStore.delete(cleanEmail);
      return { valid: false, error: 'This verification code has expired. Please request a new one.' };
    }

    if (memoryRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
      memoryOtpStore.delete(cleanEmail);
      return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }

    if (memoryRecord.hash !== expectedHash) {
      memoryRecord.attempts += 1;
      const remainingAttempts = MAX_VERIFY_ATTEMPTS - memoryRecord.attempts;
      return {
        valid: false,
        error: `Incorrect code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      };
    }

    // Valid! Invalidate immediately
    memoryRecord.used = true;
    memoryOtpStore.delete(cleanEmail);
    return { valid: true };
  }

  // 2. Fallback to Supabase password_reset_otps table
  try {
    const { data: records, error } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', cleanEmail)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !records || records.length === 0) {
      return { valid: false, error: 'Invalid or expired verification code.' };
    }

    const record = records[0];

    if (new Date(record.expires_at).getTime() < now) {
      return { valid: false, error: 'This verification code has expired. Please request a new one.' };
    }

    if ((record.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
      return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }

    if (record.otp_hash !== expectedHash) {
      await supabase
        .from('password_reset_otps')
        .update({ attempts: (record.attempts || 0) + 1 })
        .eq('id', record.id);

      return { valid: false, error: 'Incorrect verification code.' };
    }

    // Invalidate in DB
    await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('id', record.id);

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: 'Could not verify code at this time.' };
  }
}
