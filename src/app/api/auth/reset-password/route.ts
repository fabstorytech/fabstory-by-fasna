import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAndInvalidateOtp } from '@/lib/auth/otp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { email, otp, newPassword } = body || {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, error: '6-digit verification code is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      const digits = cleanEmail.replace(/\D/g, '');
      if (digits.length >= 10) {
        cleanEmail = `${digits.slice(-10)}@fabstory.in`;
      }
    }

    // 1. Verify and consume OTP server-side
    const verification = await verifyAndInvalidateOtp(cleanEmail, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid or expired code.' },
        { status: 400 }
      );
    }

    // 2. Update user's password in Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let passwordUpdated = false;

    // Method 1: Try via Service Role Key (Official Supabase Auth Admin API)
    if (serviceRoleKey && serviceRoleKey.trim() && supabaseUrl) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey.trim(), {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: usersData, error: listError } =
          await supabaseAdmin.auth.admin.listUsers();

        const targetUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (targetUser) {
          const { error: updateError } =
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              password: newPassword,
            });

          if (!updateError) {
            passwordUpdated = true;
          } else {
            console.error('[Reset Password Admin API Error]', updateError);
          }
        } else {
          console.warn('[Reset Password] User not found in auth.users:', cleanEmail);
        }
      } catch (adminErr) {
        console.error('[Reset Password Admin API Exception]', adminErr);
      }
    }

    // Method 2: Try via Supabase RPC function (reset_user_password)
    if (!passwordUpdated) {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data: rpcSuccess, error: rpcError } = await supabase.rpc(
          'reset_user_password',
          {
            user_email: cleanEmail,
            new_password: newPassword,
          }
        );

        if (!rpcError && rpcSuccess) {
          passwordUpdated = true;
        }
      } catch (rpcErr) {
        // RPC might not be created yet in SQL editor
      }
    }

    if (!passwordUpdated) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Password could not be updated because SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Please add your service_role key from Supabase Project Settings > API.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('[Reset Password Exception]', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
