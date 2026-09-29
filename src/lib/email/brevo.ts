import { BRAND } from '@/lib/constants';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendBrevoEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  replyTo?: EmailRecipient;
  tags?: string[];
}

export interface BrevoEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a transactional email using the official Brevo REST API v3.
 * Server-side ONLY. Never call from client-side components.
 */
export async function sendBrevoEmail(
  options: SendBrevoEmailOptions
): Promise<BrevoEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey.includes('your-brevo-api-key')) {
    console.warn(
      '[Brevo] BREVO_API_KEY is not configured or using placeholder. Transactional email simulated.'
    );
    return {
      success: false,
      error: 'BREVO_API_KEY is not configured in environment variables.',
    };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || BRAND.email;
  const senderName = process.env.BREVO_SENDER_NAME || BRAND.fullName;

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: options.to.map((recipient) => ({
        email: recipient.email.trim().toLowerCase(),
        name: recipient.name || recipient.email.split('@')[0],
      })),
      subject: options.subject,
      htmlContent: options.htmlContent,
      ...(options.replyTo
        ? {
            replyTo: {
              email: options.replyTo.email,
              name: options.replyTo.name || options.replyTo.email,
            },
          }
        : {
            replyTo: {
              email: BRAND.email,
              name: BRAND.fullName,
            },
          }),
      ...(options.tags && options.tags.length > 0 ? { tags: options.tags } : {}),
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `Brevo API HTTP ${response.status}`;
      console.error('[Brevo Error]', {
        status: response.status,
        message: errorMsg,
        subject: options.subject,
      });
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (err: any) {
    console.error('[Brevo Transport Exception]', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch email via Brevo transport.',
    };
  }
}
