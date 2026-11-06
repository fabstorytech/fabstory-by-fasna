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

  // Generate luxury branded order confirmation email for testing
  const { getOrderConfirmationCustomerHtml } = await import('@/lib/email/templates');
  const demoOrder = {
    order_number: `FAB-${Date.now().toString().slice(-6)}`,
    customer_name: 'Fasna',
    customer_email: targetEmail,
    customer_phone: '+91 96562 76402',
    shipping_address: {
      street: 'Emerald Villa, Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682031'
    },
    items: [
      {
        id: 'item-1',
        name: 'Handcrafted Anarkali Silk Gown',
        fabric: 'Pure Mulberry Silk',
        size: 'M (Tailored)',
        quantity: 1,
        price: 4999
      },
      {
        id: 'item-2',
        name: 'Zari Embroidered Dupatta',
        fabric: 'Organza',
        size: '2.5 Meters',
        quantity: 1,
        price: 1899
      }
    ],
    total_amount: 6898,
    payment_method: 'Instant Online Payment (UPI / Cards)',
    created_at: new Date().toISOString()
  };

  const htmlContent = getOrderConfirmationCustomerHtml(demoOrder);

  const result = await sendBrevoEmail({
    to: [{ email: targetEmail, name: 'Fasna' }],
    subject: `Order #${demoOrder.order_number} Confirmed — ${BRAND.fullName}`,
    htmlContent,
    tags: ['order-confirmation-luxury-preview'],
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
