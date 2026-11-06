import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required to create a payment order.' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TwqSE37IC4d0ON';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'wmhjpIHj0RBTIwT4bE9qpOZb';

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay API credentials are not configured.' },
        { status: 500 }
      );
    }

    // Razorpay requires the amount in paise (1 INR = 100 Paise)
    // Round to nearest integer to avoid float precision issues
    const amountInPaise = Math.round(body.amount * 100);

    const receipt = (body.receipt || `rcpt_${Date.now().toString(36)}`).slice(0, 40);

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          customerName: body.customerName || 'Customer',
          customerEmail: body.customerEmail || '',
          orderType: body.orderType || 'READY_STOCK',
        },
      }),
    });

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('[Razorpay Order Creation Failed]', data);
      return NextResponse.json(
        {
          success: false,
          error: data.error?.description || data.error?.message || 'Razorpay order creation failed.',
        },
        { status: razorpayResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
    });
  } catch (err: any) {
    console.error('[Create Razorpay Order Error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error while initializing payment.' },
      { status: 500 }
    );
  }
}

