import { BRAND } from '@/lib/constants';

interface OrderItem {
  id?: string;
  name: string;
  fabric?: string;
  size?: string;
  quantity: number;
  price: number;
}

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: any;
  items: OrderItem[];
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
  tracking_number?: string;
  tracking_url?: string;
}

function baseEmailWrapper(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5EF;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F5EF; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Top Brand Header -->
          <tr>
            <td align="center" style="background-color: #23484A; padding: 30px 20px; border-bottom: 3px solid #C7A66A;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-family: Georgia, serif; font-size: 24px; letter-spacing: 4px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; display: block;">
                      ${BRAND.name}
                    </span>
                    <span style="font-size: 10px; letter-spacing: 3px; color: #C7A66A; font-weight: 600; text-transform: uppercase; display: block; margin-top: 4px;">
                      — ${BRAND.subBrand} —
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Body Content -->
          <tr>
            <td style="padding: 35px 30px; color: #243234;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF8F5; padding: 25px 30px; border-top: 1px solid #E5E0D8; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 13px; color: #23484A; font-weight: 600;">
                ${BRAND.fullName}
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #6F7775; line-height: 1.5;">
                ${BRAND.description}<br>
                ${BRAND.location} • WhatsApp: ${BRAND.whatsappDisplay}
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="${BRAND.siteUrl}" style="color: #C7A66A; text-decoration: none; font-size: 11px; font-weight: 600;">Visit Boutique</a>
                  </td>
                  <td style="color: #E5E0D8;">•</td>
                  <td style="padding: 0 10px;">
                    <a href="${BRAND.instagram}" style="color: #C7A66A; text-decoration: none; font-size: 11px; font-weight: 600;">Instagram</a>
                  </td>
                  <td style="color: #E5E0D8;">•</td>
                  <td style="padding: 0 10px;">
                    <a href="${BRAND.whatsapp}" style="color: #C7A66A; text-decoration: none; font-size: 11px; font-weight: 600;">Chat on WhatsApp</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Password Reset OTP Template
 */
export function getOtpEmailHtml(options: {
  otp: string;
  expiryMinutes?: number;
  customerName?: string;
}): string {
  const { otp, expiryMinutes = 10, customerName } = options;
  const greeting = customerName ? `Dear ${customerName},` : 'Hello,';

  const content = `
    <h1 style="font-family: Georgia, serif; font-size: 22px; color: #23484A; margin: 0 0 12px 0; font-weight: 600;">
      Password Reset Verification
    </h1>
    <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A5568;">
      ${greeting} We received a request to reset your password for your <strong>${BRAND.fullName}</strong> account.
    </p>
    <p style="margin: 0 0 25px 0; font-size: 13px; line-height: 1.5; color: #6F7775;">
      Use the secure one-time verification code below to set a new password. This code will expire in <strong>${expiryMinutes} minutes</strong>.
    </p>

    <!-- OTP Code Box -->
    <div style="background-color: #FAF8F5; border: 2px dashed #C7A66A; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6F7775; font-weight: 600; display: block; margin-bottom: 8px;">
        Your Verification Code
      </span>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #23484A; display: inline-block;">
        ${otp}
      </span>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #718096;">
      🔒 <strong>Security Tip:</strong> Never share this OTP with anyone. Fabstory will never call or message asking for your code.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.5; color: #A0AEC0;">
      If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.
    </p>
  `;

  return baseEmailWrapper('Password Reset Verification — Fabstory by Fasna', content);
}

/**
 * 2. Razorpay Order Confirmation (Customer)
 */
export function getOrderConfirmationCustomerHtml(order: OrderData): string {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F0ECE4;">
          <strong style="color: #23484A; font-size: 13px; display: block;">${item.name}</strong>
          ${item.fabric || item.size ? `<span style="font-size: 11px; color: #6F7775;">${[item.fabric, item.size].filter(Boolean).join(' • ')}</span>` : ''}
        </td>
        <td align="center" style="padding: 12px 10px; border-bottom: 1px solid #F0ECE4; font-size: 12px; color: #4A5568;">
          x${item.quantity}
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F0ECE4; font-size: 13px; font-weight: 600; color: #23484A;">
          ₹ ${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>`
    )
    .join('');

  const shippingAddr = order.shipping_address
    ? typeof order.shipping_address === 'string'
      ? order.shipping_address
      : [
          order.shipping_address.street || order.shipping_address.address,
          order.shipping_address.city,
          order.shipping_address.state,
          order.shipping_address.pincode,
        ]
          .filter(Boolean)
          .join(', ')
    : 'Provided at checkout';

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="display: inline-block; background-color: #E6F4EA; color: #137333; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; rounded-full; border-radius: 20px;">
        ✓ Order Confirmed
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 24px; color: #23484A; margin: 10px 0 4px 0; font-weight: 600;">
        Thank You for Your Order!
      </h1>
      <p style="margin: 0; font-size: 13px; color: #6F7775;">
        Order #${order.order_number} has been received and verified.
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4A5568;">
      Dear <strong>${order.customer_name}</strong>,<br>
      We are thrilled to begin crafting your bespoke outfit. Your payment via <strong>${order.payment_method || 'Razorpay'}</strong> has been successfully processed.
    </p>

    <!-- Order Items Table -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #23484A;">
          <th align="left" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6F7775;">Item</th>
          <th align="center" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6F7775;">Qty</th>
          <th align="right" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6F7775;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" align="left" style="padding-top: 14px; font-size: 13px; font-weight: 600; color: #243234;">
            Total Paid
          </td>
          <td align="right" style="padding-top: 14px; font-size: 16px; font-weight: 700; color: #23484A;">
            ₹ ${Number(order.total_amount).toLocaleString('en-IN')}
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- Delivery Details Box -->
    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 18px; margin: 25px 0;">
      <h3 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #23484A;">
        📦 Shipping & Delivery Address
      </h3>
      <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.5;">
        ${shippingAddr}
      </p>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #6F7775;">
        <strong>Estimated Delivery:</strong> 7 - 10 business days for tailored craftsmanship.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${BRAND.siteUrl}/track-order?order=${order.order_number}" style="display: inline-block; background-color: #23484A; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 26px; border-radius: 4px; text-decoration: none;">
        Track Order Status
      </a>
    </div>
  `;

  return baseEmailWrapper(`Order #${order.order_number} Confirmed — Fabstory by Fasna`, content);
}

/**
 * 3. Razorpay Order Notification (Admin)
 */
export function getAdminOrderNotificationHtml(order: OrderData): string {
  const itemsList = (order.items || [])
    .map(
      (item) => `
      <li style="margin-bottom: 6px;">
        <strong>${item.name}</strong> (Qty: ${item.quantity}) - ₹ ${(item.price * item.quantity).toLocaleString('en-IN')}
        ${item.fabric || item.size ? `<br><span style="color: #718096; font-size: 11px;">Fabric: ${item.fabric || 'Standard'}, Size: ${item.size || 'Standard'}</span>` : ''}
      </li>`
    )
    .join('');

  const shippingAddr = order.shipping_address
    ? typeof order.shipping_address === 'string'
      ? order.shipping_address
      : JSON.stringify(order.shipping_address, null, 2)
    : 'Not provided';

  const content = `
    <div style="border-left: 4px solid #C7A66A; padding-left: 14px; margin-bottom: 20px;">
      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #C7A66A;">
        Store Alert
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 20px; color: #23484A; margin: 4px 0; font-weight: 600;">
        New Order Received: #${order.order_number}
      </h1>
      <p style="margin: 0; font-size: 12px; color: #6F7775;">
        A new customer order has been verified and paid via ${order.payment_method || 'Razorpay'}.
      </p>
    </div>

    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 15px 0; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #6F7775; width: 140px;">Customer Name:</td>
        <td style="padding: 6px 0; color: #23484A; font-weight: 600;">${order.customer_name}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6F7775;">Customer Email:</td>
        <td style="padding: 6px 0; color: #23484A;">${order.customer_email}</td>
      </tr>
      ${order.customer_phone ? `
      <tr>
        <td style="padding: 6px 0; color: #6F7775;">Customer Phone:</td>
        <td style="padding: 6px 0; color: #23484A;">${order.customer_phone}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 6px 0; color: #6F7775;">Total Amount:</td>
        <td style="padding: 6px 0; color: #137333; font-weight: 700; font-size: 15px;">₹ ${Number(order.total_amount).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6F7775;">Payment Status:</td>
        <td style="padding: 6px 0; color: #23484A;">${order.payment_status || 'PAID'}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6F7775;">Order Date:</td>
        <td style="padding: 6px 0; color: #23484A;">${order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}</td>
      </tr>
    </table>

    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 14px; margin: 18px 0;">
      <strong style="font-size: 12px; color: #23484A; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
        Ordered Items:
      </strong>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #2D3748;">
        ${itemsList}
      </ul>
    </div>

    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 14px; margin: 18px 0;">
      <strong style="font-size: 12px; color: #23484A; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
        Shipping Address:
      </strong>
      <pre style="margin: 0; font-family: inherit; font-size: 12px; color: #4A5568; white-space: pre-wrap;">${shippingAddr}</pre>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${BRAND.siteUrl}/admin" style="display: inline-block; background-color: #23484A; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 24px; border-radius: 4px; text-decoration: none;">
        Open Admin CMS
      </a>
    </div>
  `;

  return baseEmailWrapper(`[New Order #${order.order_number}] ₹ ${order.total_amount} - Fabstory CMS`, content);
}

/**
 * 4. Order Shipped Template (Customer)
 */
export function getOrderShippedHtml(order: OrderData): string {
  const trackingInfo = order.tracking_number
    ? `
    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #23484A;">
        Tracking Information
      </h3>
      <p style="margin: 0; font-size: 13px; color: #4A5568;">
        Tracking Number: <strong style="color: #23484A; font-family: monospace;">${order.tracking_number}</strong>
      </p>
      ${order.tracking_url ? `
      <p style="margin: 8px 0 0 0;">
        <a href="${order.tracking_url}" style="color: #C7A66A; font-size: 12px; font-weight: 600; text-decoration: underline;">
          Track live parcel location &rarr;
        </a>
      </p>` : ''}
    </div>`
    : '';

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="display: inline-block; background-color: #E8F0FE; color: #1967D2; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px;">
        🚚 Your Order is On The Way
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 24px; color: #23484A; margin: 10px 0 4px 0; font-weight: 600;">
        Order #${order.order_number} Has Been Shipped!
      </h1>
      <p style="margin: 0; font-size: 13px; color: #6F7775;">
        Your tailored Fabstory package is on its way to you.
      </p>
    </div>

    <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A5568;">
      Dear <strong>${order.customer_name}</strong>,<br>
      Great news! Our master tailors have completed your garment with love & detail. Your parcel has now been handed over to our courier partner.
    </p>

    ${trackingInfo}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${BRAND.siteUrl}/track-order?order=${order.order_number}" style="display: inline-block; background-color: #23484A; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 26px; border-radius: 4px; text-decoration: none;">
        Track Your Shipment
      </a>
    </div>
  `;

  return baseEmailWrapper(`Order #${order.order_number} Has Shipped! — Fabstory by Fasna`, content);
}

/**
 * 5. Order Delivered Template (Customer)
 */
export function getOrderDeliveredHtml(order: OrderData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="display: inline-block; background-color: #E6F4EA; color: #137333; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px;">
        ✨ Delivered Successfully
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 24px; color: #23484A; margin: 10px 0 4px 0; font-weight: 600;">
        Order #${order.order_number} Delivered!
      </h1>
      <p style="margin: 0; font-size: 13px; color: #6F7775;">
        Your handcrafted outfit has arrived.
      </p>
    </div>

    <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A5568;">
      Dear <strong>${order.customer_name}</strong>,<br>
      Your order has been safely delivered to your address. We hope you love wearing your new piece as much as we loved curating and tailoring it for you!
    </p>

    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
      <h3 style="font-family: Georgia, serif; font-size: 16px; color: #23484A; margin: 0 0 8px 0;">
        How does it fit?
      </h3>
      <p style="margin: 0 0 14px 0; font-size: 12px; color: #6F7775; line-height: 1.5;">
        If you have any questions regarding fit, styling, or care instructions, our team is always here to assist you on WhatsApp.
      </p>
      <a href="${BRAND.whatsapp}?text=Hi%20Fabstory!%20I%20received%20my%20order%20${order.order_number}." style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 8px 18px; border-radius: 4px; text-decoration: none;">
        Chat with Stylist
      </a>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${BRAND.siteUrl}/shop" style="display: inline-block; background-color: #23484A; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 26px; border-radius: 4px; text-decoration: none;">
        Explore New Arrivals
      </a>
    </div>
  `;

  return baseEmailWrapper(`Order #${order.order_number} Delivered — Fabstory by Fasna`, content);
}
