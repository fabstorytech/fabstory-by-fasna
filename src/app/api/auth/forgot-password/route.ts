import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createPasswordResetOtp } from '@/lib/auth/otp';
import { sendBrevoEmail } from '@/lib/email/brevo';
import { getOtpEmailHtml } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawEmail = body?.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    let cleanEmail = rawEmail.trim().toLowerCase();

    // Support Indian mobile normalization like existing account login
    if (!cleanEmail.includes('@')) {
      const digits = cleanEmail.replace(/\D/g, '');
      if (digits.length >= 10) {
        cleanEmail = `${digits.slice(-10)}@fabstory.in`;
      } else {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
    }

    // Check if customer exists in customers table
    let customerName = '';
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('full_name')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (customer?.full_name) {
        customerName = customer.full_name;
      }
    } catch {
      // Ignore if table query fails
    }

    // Generate secure hashed OTP with rate limit protection
    const otpResult = await createPasswordResetOtp(cleanEmail);

    if (!otpResult.success || !otpResult.otp) {
      return NextResponse.json(
        {
          success: false,
          error: otpResult.error || 'Failed to generate verification code.',
          cooldownRemaining: otpResult.cooldownRemaining,
        },
        { status: 429 }
      );
    }

    // Send OTP via Brevo
    const emailHtml = getOtpEmailHtml({
      otp: otpResult.otp,
      expiryMinutes: 10,
      customerName,
    });

    const emailResult = await sendBrevoEmail({
      to: [{ email: cleanEmail, name: customerName }],
      subject: 'Your Fabstory Verification Code',
      htmlContent: emailHtml,
      tags: ['password-reset-otp'],
    });

    if (!emailResult.success) {
      console.error('[Forgot Password] Brevo dispatch notice:', emailResult.error);
    }

    // Always return safe neutral message to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a 6-digit verification code has been sent.',
    });
  } catch (err: any) {
    console.error('[Forgot Password Error]', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
