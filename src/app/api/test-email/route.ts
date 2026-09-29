import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoEmail } from '@/lib/email/brevo';
import { BRAND } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const toParam = searchParams.get('to');
  const targetEmail =
    toParam ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.BREVO_SENDER_EMAIL;

  if (!targetEmail || !targetEmail.includes('@')) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Please provide an email to test via query parameter, e.g.: /api/test-email?to=your_email@gmail.com',
        configuredSender: process.env.BREVO_SENDER_EMAIL || 'Not set',
      },
      { status: 400 }
    );
  }

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #E5E0D8; border-radius: 8px; background: #FFFFFF;">
      <h2 style="color: #23484A; margin-bottom: 8px;">✨ Brevo Email Integration Test</h2>
      <p style="color: #6F7775; font-size: 13px; margin-top: 0;">Fabstory by Fasna Transactional Email System</p>
      <hr style="border: none; border-top: 1px solid #E5E0D8; margin: 15px 0;" />
      <p style="color: #243234; font-size: 14px; line-height: 1.6;">
        Congratulations! Your Brevo API key and sender configuration are <strong>fully working</strong>.
      </p>
      <ul style="color: #4A5568; font-size: 12px; line-height: 1.8;">
        <li><strong>Sender:</strong> ${process.env.BREVO_SENDER_NAME || BRAND.fullName} (${process.env.BREVO_SENDER_EMAIL})</li>
        <li><strong>Recipient:</strong> ${targetEmail}</li>
        <li><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN')}</li>
      </ul>
      <p style="color: #137333; font-size: 12px; font-weight: bold; margin-top: 20px;">
        ✓ Ready for Password Reset OTP, Order Confirmations & Shipping Notifications.
      </p>
    </div>
  `;

  const result = await sendBrevoEmail({
    to: [{ email: targetEmail, name: 'Fabstory Test' }],
    subject: `[Test] Brevo Integration Working — ${BRAND.fullName}`,
    htmlContent,
    tags: ['test-email'],
  });

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        configuredSender: process.env.BREVO_SENDER_EMAIL,
        help:
          'If you see an error about unverified sender, make sure BREVO_SENDER_EMAIL is verified in your Brevo Dashboard (Senders & IP).',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Test email dispatched successfully to ${targetEmail}! Please check your inbox and spam folder.`,
    messageId: result.messageId,
    sender: process.env.BREVO_SENDER_EMAIL,
  });
}
