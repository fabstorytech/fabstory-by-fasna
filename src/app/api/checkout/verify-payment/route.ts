import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { sendBrevoEmail } from '@/lib/email/brevo';
import {
  getOrderConfirmationCustomerHtml,
  getAdminOrderNotificationHtml,
} from '@/lib/email/templates';
import { BRAND } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid order payload.' },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      paymentMethod = 'Razorpay',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!customerEmail || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer name, email, and order items are required.' },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay Signature if keys and signature are provided
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (
      razorpaySecret &&
      !razorpaySecret.includes('placeholder') &&
      razorpayOrderId &&
      razorpayPaymentId &&
      razorpaySignature
    ) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        console.error('[Razorpay Signature Mismatch]', {
          razorpayOrderId,
          razorpayPaymentId,
        });
        return NextResponse.json(
          { success: false, error: 'Payment signature verification failed.' },
          { status: 400 }
        );
      }
    }

    // 2. Check for duplicate order / idempotency via razorpayPaymentId if provided
    let existingOrder: any = null;
    if (razorpayPaymentId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_payment_id', razorpayPaymentId)
        .maybeSingle();

      if (data) {
        existingOrder = data;
      }
    }

    let orderNumber = existingOrder?.order_number;
    let orderId = existingOrder?.id;
    let shouldSendEmails = false;

    if (existingOrder) {
      // Order already exists, check if email was already sent
      shouldSendEmails = !existingOrder.confirmation_email_sent;
    } else {
      // 3. Create fresh order in Supabase
      orderNumber = `FAB-${Date.now().toString().slice(-6)}`;
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customerName,
            customer_email: customerEmail.trim().toLowerCase(),
            customer_phone: customerPhone || '',
            shipping_address: shippingAddress || {},
            items: items,
            total_amount: totalAmount,
            status: 'PENDING',
            payment_status: 'PAID',
            payment_method: paymentMethod,
            razorpay_order_id: razorpayOrderId || null,
            razorpay_payment_id: razorpayPaymentId || null,
            confirmation_email_sent: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('[Supabase Order Insert Warning]', insertError);
      } else if (newOrder) {
        orderId = newOrder.id;
        orderNumber = newOrder.order_number;
      }

      shouldSendEmails = true;
    }

    // 4. Send Confirmation & Admin Notification Emails via Brevo (Fail-Safe)
    if (shouldSendEmails && orderNumber) {
      const orderData = {
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items: items,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'PAID',
        created_at: new Date().toISOString(),
      };

      try {
        // Customer Order Confirmation Email
        const customerHtml = getOrderConfirmationCustomerHtml(orderData);
        const customerEmailResult = await sendBrevoEmail({
          to: [{ email: customerEmail, name: customerName }],
          subject: `Order #${orderNumber} Confirmed — Fabstory by Fasna`,
          htmlContent: customerHtml,
          tags: ['order-confirmation'],
        });

        // Admin Notification Email
        const adminEmail =
          process.env.ADMIN_NOTIFICATION_EMAIL || BRAND.email;
        const adminHtml = getAdminOrderNotificationHtml(orderData);
        const adminEmailResult = await sendBrevoEmail({
          to: [{ email: adminEmail, name: 'Fabstory Admin' }],
          subject: `[New Order #${orderNumber}] ₹ ${totalAmount} - ${customerName}`,
          htmlContent: adminHtml,
          tags: ['admin-order-notification'],
        });

        if (customerEmailResult.success || adminEmailResult.success) {
          // Mark confirmation_email_sent = true to prevent duplicate emails
          if (orderId) {
            await supabase
              .from('orders')
              .update({ confirmation_email_sent: true })
              .eq('id', orderId);
          } else if (orderNumber) {
            await supabase
              .from('orders')
              .update({ confirmation_email_sent: true })
              .eq('order_number', orderNumber);
          }
        }
      } catch (emailErr) {
        // Fail-safe: Email error must never fail the verified order
        console.error('[Order Email Dispatch Failed]', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Order verified and confirmed successfully.',
    });
  } catch (err: any) {
    console.error('[Verify Payment Exception]', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'Internal order processing error.' },
      { status: 500 }
    );
  }
}
