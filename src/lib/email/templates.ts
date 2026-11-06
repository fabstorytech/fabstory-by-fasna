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

const BRAND_LOGO_URL = 'https://res.cloudinary.com/jwter84c/image/upload/v1793967372/fabstory-branding/fabstory_email_logo_perfect.png';

function baseEmailWrapper(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .email-content { padding: 24px 18px !important; }
      .email-header { padding: 26px 16px !important; }
      .brand-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5EF; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F5EF; padding: 25px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table role="presentation" class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          
          <!-- Luxury Brand Header (Nike / Zara Precision) -->
          <tr>
            <td class="email-header" align="center" style="background: linear-gradient(180deg, #1A3536 0%, #23484A 100%); padding: 32px 24px 28px 24px; border-bottom: 3px solid #C7A66A;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center" style="padding: 0;">
                    
                    <!-- Perfect Fit Circular Brand Logo (Direct CDN Image with Embedded Gold Ring) -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td align="center" style="padding: 0; border: none; background: transparent;">
                          <img 
                            src="${BRAND_LOGO_URL}" 
                            alt="${BRAND.fullName}" 
                            width="86" 
                            height="86" 
                            style="width: 86px; height: 86px; max-width: 86px; max-height: 86px; border: 0; outline: none; text-decoration: none; display: block; margin: 0 auto;"
                          />
                        </td>
                      </tr>
                    </table>

                    <!-- Brand Typography Wordmark -->
                    <span class="brand-title" style="font-family: Georgia, Garamond, serif; font-size: 22px; letter-spacing: 4px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; display: block; line-height: 1.2;">
                      FABSTORY
                    </span>
                    <span style="font-size: 10px; letter-spacing: 3px; color: #C7A66A; font-weight: 700; text-transform: uppercase; display: block; margin-top: 3px;">
                      BY FASNA
                    </span>
                    <span style="font-family: Georgia, serif; font-size: 10px; letter-spacing: 1px; color: #A5BDBB; font-style: italic; display: block; margin-top: 4px;">
                      Where Style Meets Your Story
                    </span>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Email Body -->
          <tr>
            <td class="email-content" style="padding: 36px 32px; color: #243234;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Luxury Boutique Footer -->
          <tr>
            <td style="background-color: #FAF8F5; padding: 28px 24px; border-top: 1px solid #E5E0D8; text-align: center;">
              
              <!-- Footer Mini Medallion -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 12px;">
                <tr>
                  <td style="border-top: 1px solid #E5E0D8; width: 60px;"></td>
                  <td style="padding: 0 10px; color: #C7A66A; font-size: 12px;">✦</td>
                  <td style="border-top: 1px solid #E5E0D8; width: 60px;"></td>
                </tr>
              </table>

              <p style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 14px; color: #23484A; font-weight: 600;">
                ${BRAND.fullName}
              </p>
              <p style="margin: 0 0 14px 0; font-size: 11px; color: #6F7775; line-height: 1.6;">
                Bespoke Couture & Luxury Ready-to-Ship Outfits<br>
                Kerala, India • WhatsApp Support: <strong>${BRAND.whatsappDisplay}</strong>
              </p>

              <!-- Social & Store Navigation -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${BRAND.siteUrl}" style="color: #23484A; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">Visit Boutique</a>
                  </td>
                  <td style="color: #C7A66A; font-size: 10px;">•</td>
                  <td style="padding: 0 8px;">
                    <a href="${BRAND.whatsapp}" style="color: #128C7E; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">WhatsApp Stylist</a>
                  </td>
                  <td style="color: #C7A66A; font-size: 10px;">•</td>
                  <td style="padding: 0 8px;">
                    <a href="${BRAND.instagram}" style="color: #23484A; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">Instagram</a>
                  </td>
                </tr>
              </table>

              <!-- Copyright & Agency Attribution -->
              <p style="margin: 18px 0 0 0; font-size: 10px; color: #9AA3A2; line-height: 1.5;">
                © ${new Date().getFullYear()} Fabstory by Fasna. All rights reserved.<br>
                Crafted with love by <a href="https://ekodrix.com" style="color: #718887; text-decoration: underline;">Ekodrix</a> (ekodrix.com)
              </p>
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
 * 1. Password Reset OTP Template (Amazon / Apple Security Style)
 */
export function getOtpEmailHtml(options: {
  otp: string;
  expiryMinutes?: number;
  customerName?: string;
}): string {
  const { otp, expiryMinutes = 10, customerName } = options;
  const greeting = customerName ? `Dear ${customerName},` : 'Hello,';

  const content = `
    <!-- Top Security Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 32px; line-height: 1; margin-bottom: 12px;">🛡️</div>
      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; color: #C7A66A; display: block; margin-bottom: 6px;">
        SECURITY VERIFICATION
      </span>
      <h1 style="font-family: Georgia, Garamond, serif; font-size: 24px; color: #23484A; margin: 0 0 8px 0; font-weight: 600;">
        Reset Your Account Password
      </h1>
      <p style="margin: 0; font-size: 13px; color: #6F7775; line-height: 1.5;">
        ${greeting} We received a request to access your <strong>${BRAND.fullName}</strong> account.
      </p>
    </div>

    <!-- OTP Code Container (Amazon / Apple Style Monospace Spaced Digits) -->
    <div style="background-color: #FAF8F5; border: 2px dashed #C7A66A; border-radius: 12px; padding: 26px 20px; text-align: center; margin: 24px 0;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6F7775; font-weight: 700; display: block; margin-bottom: 10px;">
        One-Time Verification Code
      </span>
      <div style="background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 8px; padding: 14px 20px; display: inline-block; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #23484A; display: inline-block; padding-left: 12px;">
          ${otp}
        </span>
      </div>
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #8C6D37; font-weight: 600;">
        ⏱ Expires in ${expiryMinutes} minutes
      </p>
    </div>

    <!-- Security Warnings -->
    <div style="background-color: #F8F9FA; border-left: 3px solid #23484A; padding: 14px 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4A5568;">
        <strong>Security Notice:</strong> Never share this verification code with anyone. Fabstory representatives will never ask for your password or OTP.
      </p>
    </div>

    <p style="margin: 18px 0 0 0; font-size: 12px; line-height: 1.5; color: #9AA3A2; text-align: center;">
      If you did not request this code, you can safely ignore this email. Your account remains protected.
    </p>
  `;

  return baseEmailWrapper('Password Reset Verification — Fabstory by Fasna', content);
}

/**
 * 2. Order Confirmation (Customer) — Nike / Zara / Amazon Luxury Style
 */
export function getOrderConfirmationCustomerHtml(order: OrderData): string {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #F0ECE4;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align: top;">
                <strong style="color: #23484A; font-size: 14px; display: block; font-family: Georgia, serif; line-height: 1.3;">
                  ${item.name}
                </strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6F7775;">
                  ${[item.fabric, item.size ? `Size: ${item.size}` : ''].filter(Boolean).join(' • ')}
                </p>
                <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #23484A; background-color: #FAF8F5; border: 1px solid #E5E0D8; padding: 2px 8px; border-radius: 3px; margin-top: 6px;">
                  Qty: ${item.quantity}
                </span>
              </td>
              <td align="right" style="vertical-align: top; white-space: nowrap;">
                <span style="font-size: 14px; font-weight: 700; color: #23484A;">
                  ₹ ${(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </td>
            </tr>
          </table>
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
    <!-- Order Confirmed Status Ribbon -->
    <div style="text-align: center; margin-bottom: 26px;">
      <div style="font-size: 32px; line-height: 1; margin-bottom: 12px;">✨</div>
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #2E7D32; display: inline-block; background-color: #E8F5E9; border: 1px solid #C8E6C9; padding: 4px 14px; border-radius: 14px; margin-bottom: 10px;">
        ✓ PAYMENT VERIFIED • ORDER CONFIRMED
      </span>
      <h1 style="font-family: Georgia, Garamond, serif; font-size: 26px; color: #23484A; margin: 0 0 6px 0; font-weight: 600;">
        Thank You for Your Order
      </h1>
      <p style="margin: 0; font-size: 13px; color: #6F7775;">
        Order reference <strong style="color: #23484A; font-family: monospace;">#${order.order_number}</strong>
      </p>
    </div>

    <!-- Metadata 2-Column Info Card (Nike / Zara style) -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; margin-bottom: 26px;">
      <tr>
        <td style="padding: 16px; border-right: 1px solid #E5E0D8; width: 50%;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8C6D37; display: block;">
            CUSTOMER
          </span>
          <strong style="font-size: 13px; color: #243234; display: block; margin-top: 3px;">
            ${order.customer_name}
          </strong>
          <span style="font-size: 11px; color: #6F7775; display: block; margin-top: 2px;">
            ${order.customer_email}
          </span>
        </td>
        <td style="padding: 16px; width: 50%;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8C6D37; display: block;">
            PAYMENT METHOD
          </span>
          <strong style="font-size: 13px; color: #243234; display: block; margin-top: 3px;">
            Online Payment (Verified)
          </strong>
          <span style="font-size: 11px; color: #2E7D32; font-weight: 600; display: block; margin-top: 2px;">
            ● 256-Bit SSL Encrypted
          </span>
        </td>
      </tr>
    </table>

    <!-- Order Items Header -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-bottom: 2px solid #23484A; padding-bottom: 8px; margin-bottom: 4px;">
      <tr>
        <td align="left">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #23484A;">
            Order Items Summary
          </span>
        </td>
        <td align="right">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6F7775;">
            Amount
          </span>
        </td>
      </tr>
    </table>

    <!-- Order Items List -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 16px; border-top: 1px solid #E5E0D8; padding-top: 12px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #6F7775;">Subtotal</td>
        <td align="right" style="padding: 6px 0; font-size: 13px; color: #243234; font-weight: 600;">
          ₹ ${Number(order.total_amount).toLocaleString('en-IN')}
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #6F7775;">Express Insured Delivery</td>
        <td align="right" style="padding: 6px 0; font-size: 13px; color: #2E7D32; font-weight: 700;">
          FREE
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 0 0 0; font-size: 15px; font-weight: 700; color: #23484A; border-top: 2px solid #23484A;">
          Total Paid
        </td>
        <td align="right" style="padding: 14px 0 0 0; font-size: 20px; font-weight: 800; color: #23484A; border-top: 2px solid #23484A;">
          ₹ ${Number(order.total_amount).toLocaleString('en-IN')}
        </td>
      </tr>
    </table>

    <!-- Shipping Address & Fulfillment Card -->
    <div style="background-color: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin: 26px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="vertical-align: top;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #23484A; display: block; margin-bottom: 8px;">
              📦 Delivery Address
            </span>
            <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.6;">
              ${shippingAddr}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #23484A; font-weight: 600;">
              🚚 Estimated Delivery: <strong>3 – 5 Business Days</strong> (Express Courier)
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Primary CTA Button (Zara / Nike High-Conversion Style) -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${BRAND.siteUrl}/track-order?order=${order.order_number}" style="background-color: #23484A; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 15px 36px; border-radius: 6px; display: inline-block; text-decoration: none; box-shadow: 0 4px 14px rgba(35, 72, 74, 0.28);">
        TRACK ORDER STATUS
      </a>
    </div>

    <!-- WhatsApp Support Pill -->
    <div style="text-align: center; margin-top: 14px;">
      <span style="font-size: 12px; color: #6F7775;">
        Need alterations or styling guidance? 
        <a href="${BRAND.whatsapp}?text=Hi%20Fasna,%20I%20have%20a%20question%20about%20order%20%23${order.order_number}" style="color: #128C7E; font-weight: 700; text-decoration: underline;">
          Chat with Fasna on WhatsApp &rarr;
        </a>
      </span>
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
