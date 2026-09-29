import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendBrevoEmail } from '@/lib/email/brevo';
import {
  getOrderShippedHtml,
  getOrderDeliveredHtml,
} from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { orderId, status, trackingNumber, trackingUrl } = body || {};

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and new status are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch current order state from Supabase
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;
    const newStatus = status.toUpperCase();
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) {
      updatePayload.tracking_number = trackingNumber;
    }
    if (trackingUrl) {
      updatePayload.tracking_url = trackingUrl;
    }

    const orderData = {
      ...order,
      tracking_number: trackingNumber || order.tracking_number,
      tracking_url: trackingUrl || order.tracking_url,
    };

    // 2. Trigger "Order Shipped" Email if transitioning to SHIPPED and not previously sent
    if (newStatus === 'SHIPPED') {
      const alreadySent = Boolean(order.shipped_email_sent);
      const isActualTransition = previousStatus !== 'SHIPPED';

      if (isActualTransition && !alreadySent && order.customer_email) {
        try {
          const emailHtml = getOrderShippedHtml(orderData);
          const emailResult = await sendBrevoEmail({
            to: [{ email: order.customer_email, name: order.customer_name }],
            subject: `Your Fabstory Order #${order.order_number} Has Shipped!`,
            htmlContent: emailHtml,
            tags: ['order-shipped'],
          });

          if (emailResult.success) {
            updatePayload.shipped_email_sent = true;
          }
        } catch (emailErr) {
          console.error('[Order Shipped Email Exception]', emailErr);
        }
      }
    }

    // 3. Trigger "Order Delivered" Email if transitioning to DELIVERED and not previously sent
    if (newStatus === 'DELIVERED') {
      const alreadySent = Boolean(order.delivered_email_sent);
      const isActualTransition = previousStatus !== 'DELIVERED';

      if (isActualTransition && !alreadySent && order.customer_email) {
        try {
          const emailHtml = getOrderDeliveredHtml(orderData);
          const emailResult = await sendBrevoEmail({
            to: [{ email: order.customer_email, name: order.customer_name }],
            subject: `Your Fabstory Order #${order.order_number} Has Been Delivered!`,
            htmlContent: emailHtml,
            tags: ['order-delivered'],
          });

          if (emailResult.success) {
            updatePayload.delivered_email_sent = true;
          }
        } catch (emailErr) {
          console.error('[Order Delivered Email Exception]', emailErr);
        }
      }
    }

    // 4. Update order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updateError) {
      console.error('[Update Order Status DB Error]', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order status in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      shippedEmailSent: updatePayload.shipped_email_sent || order.shipped_email_sent,
      deliveredEmailSent: updatePayload.delivered_email_sent || order.delivered_email_sent,
      message: `Order status updated to ${newStatus}.`,
    });
  } catch (err: any) {
    console.error('[Update Order Status Route Exception]', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating status.' },
      { status: 500 }
    );
  }
}
