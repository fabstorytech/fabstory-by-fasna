// ============================================================
// Fabstory by Fasna — WhatsApp Message Formatter & Dispatcher
// ============================================================

export interface CustomOrderMessageParams {
  productName: string;
  category?: string;
  productPrice: number;
  quantity: number;
  selectedFabric: string;
  selectedSize: string;
  customizationCharge?: number;
  grandTotal: number;
  measurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    shoulder?: string;
    sleeveLength?: string;
    outfitLength?: string;
  };
  specialInstructions?: string;
  imageUrl?: string;
  referenceImageUrl?: string;
  productUrl: string;
}

export function generateCustomOrderWhatsAppMessage(params: CustomOrderMessageParams): string {
  const line = '━━━━━━━━━━━━━━━━━━';
  const subtotal = params.productPrice * params.quantity;
  const customCharge = params.customizationCharge || 0;

  const sections: string[] = [
    `🛍️ *New Custom Order Inquiry*`,
    ``,
    line,
    ``,
    `👗 *${params.productName.toUpperCase()}*`,
    `------------------`,
    params.category ? `🏷️ Category: ${params.category}` : '',
    `💰 Price: ₹${params.productPrice.toLocaleString('en-IN')}`,
    `🧵 Fabric: ${params.selectedFabric}`,
    `📏 Size: ${params.selectedSize}`,
    `📦 Quantity: ${params.quantity}`,
    `💵 Item Total: ₹${subtotal.toLocaleString('en-IN')}`,
    customCharge > 0 ? `✂️ Custom Stitching: ₹${customCharge.toLocaleString('en-IN')}` : '',
    `💰 *Grand Total: ₹${params.grandTotal.toLocaleString('en-IN')}*`,
    `------------------`,
    ``,
    line,
    ``,
    `📐 *MEASUREMENTS (inches)*`,
    `------------------`,
    `• Bust: ${params.measurements?.bust || '34'}`,
    `• Waist: ${params.measurements?.waist || '28'}`,
    `• Hips: ${params.measurements?.hips || '36'}`,
    `• Shoulder: ${params.measurements?.shoulder || '14'}`,
    `• Sleeve Length: ${params.measurements?.sleeveLength || '22'}`,
    `• Outfit Length: ${params.measurements?.outfitLength || '52'}`,
    `------------------`,
    ``,
    line,
    ``,
    `📝 *CUSTOMIZATION NOTE*`,
    params.specialInstructions?.trim() ? params.specialInstructions.trim() : 'No additional note provided.',
    ``,
  ];

  // Optional Reference Image
  if (params.referenceImageUrl) {
    sections.push(
      line,
      ``,
      `🖼️ *REFERENCE ATTACHMENT*`,
      params.referenceImageUrl,
      ``
    );
  }

  // Product Image
  if (params.imageUrl) {
    sections.push(
      line,
      ``,
      `📸 *PRODUCT IMAGE*`,
      params.imageUrl,
      ``
    );
  }

  // Product Details Page Link at the bottom (to visit the product on site)
  sections.push(
    line,
    ``,
    `🔗 *VIEW PRODUCT ON SITE*`,
    params.productUrl,
    ``,
    line,
    ``,
    `Looking forward to your response! 🙏`
  );

  return sections.filter((s) => s !== '').join('\n');
}

/**
 * Opens WhatsApp chat directly to the given phone number with clean UTF-8 text encoding.
 */
export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Ensure the message string is processed as clean UTF-8 to preserve emojis & symbols
  const processedMessage = new TextDecoder('utf-8').decode(
    new TextEncoder().encode(message)
  );
  const encoded = encodeURIComponent(processedMessage);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
