// ============================================================
// Fabstory by Fasna — Constants & Brand Configuration
// ============================================================

import type {
  NavItem,
  Product,
  Category,
  Fabric,
  Testimonial,
  MeasurementField,
} from '@/types';

// --- Brand ---

export const BRAND = {
  name: 'FABSTORY',
  subBrand: 'BY FASNA',
  tagline: 'Sewing fabulous stories',
  fullName: 'Fabstory by Fasna',
  description:
    'Where Style Meets Your Story • Specially curated for Women. Tailored with Love & Detail. Based in Kerala, shipping worldwide.',
  email: 'hello@fabstorybyfasna.com',
  phone: '+91 12345 67890',
  location: 'Based in Kerala, India',
  instagram: 'https://www.instagram.com/fabstory_by_fasna',
  instagramHandle: '@fabstory_by_fasna',
  followersCount: '15.4K',
  bioHighlights: [
    '✨ Specially curated for Women',
    '📍 Based in Kerala',
    '📥 DM to order • 🌍 Worldwide Shipping',
    '🧵 Tailored with Love & Detail',
  ],
  facebook: 'https://facebook.com/fabstorybyfasna',
  pinterest: 'https://pinterest.com/fabstorybyfasna',
  youtube: 'https://youtube.com/@fabstorybyfasna',
  whatsapp: 'https://wa.me/911234567890',
} as const;

// --- Navigation ---

export const NAV_ITEMS: NavItem[] = [
  { label: 'HOME', href: '/' },
  {
    label: 'SHOP',
    href: '/shop',
    children: [
      { label: 'All Products', href: '/shop' },
      { label: 'Dresses', href: '/shop?category=dresses' },
      { label: 'Anarkali', href: '/shop?category=anarkali' },
      { label: 'Abaya', href: '/shop?category=abaya' },
      { label: 'Kurti', href: '/shop?category=kurti' },
      { label: 'Sets', href: '/shop?category=sets' },
    ],
  },
  { label: 'CUSTOM MADE', href: '/custom-made' },
  {
    label: 'FABRICS',
    href: '/fabrics',
    children: [
      { label: 'All Fabrics', href: '/fabrics' },
      { label: 'Cotton', href: '/fabrics?material=cotton' },
      { label: 'Linen', href: '/fabrics?material=linen' },
      { label: 'Silk', href: '/fabrics?material=silk' },
      { label: 'Chiffon', href: '/fabrics?material=chiffon' },
      { label: 'Georgette', href: '/fabrics?material=georgette' },
    ],
  },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
];

// --- Footer Links ---

export const FOOTER_LINKS = {
  shop: [
    { label: 'Custom Made', href: '/custom-made' },
    { label: 'Ready to Ship', href: '/shop?type=ready_stock' },
    { label: 'Fabrics', href: '/fabrics' },
    { label: 'Accessories', href: '/shop?category=accessories' },
  ],
  help: [
    { label: 'How to Order', href: '/how-it-works' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Shipping & Delivery', href: '/shipping' },
    { label: 'Returns & Refunds', href: '/returns' },
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/contact#faq' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

// --- Empty Lists (No Hardcoded Fallback Products/Categories) ---

export const PLACEHOLDER_IMAGES = {
  hero: '/images/hero-latest.jpg',
  heroMobile: '/images/mobileview/fabstore-mobilebanner.png',
  about: '/images/about.jpg',
  craftsmanship: '/images/craftsmanship.jpg',
  customMade: '/images/custom-made.jpg',
  fabricStory: '/images/fabric-story.jpg',
  categories: {
    customMade: '/images/placeholder.jpg',
    readyToShip: '/images/placeholder.jpg',
    fabrics: '/images/placeholder.jpg',
    accessories: '/images/placeholder.jpg',
  },
  products: [],
  instagram: [],
} as const;

export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_FABRICS: Fabric[] = [];

// --- Measurement Fields ---

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: 'bust', label: 'Bust', unit: 'inches', placeholder: '34', required: true },
  { key: 'waist', label: 'Waist', unit: 'inches', placeholder: '28', required: true },
  { key: 'hip', label: 'Hip', unit: 'inches', placeholder: '36', required: true },
  { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: '14', required: true },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', placeholder: '22', required: false },
  { key: 'outfitLength', label: 'Outfit Length', unit: 'inches', placeholder: '50', required: false },
  { key: 'neck', label: 'Neck', unit: 'inches', placeholder: '14', required: false },
  { key: 'armhole', label: 'Armhole', unit: 'inches', placeholder: '16', required: false },
];

// --- Testimonials ---

export const MOCK_TESTIMONIALS: Testimonial[] = [];

// --- How It Works Steps ---

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Choose Your Design',
    description: 'Browse our collection or share your inspiration with us.',
  },
  {
    step: 2,
    title: 'Personalize Your Fit',
    description: 'Select your fabric, size, and share your measurements.',
  },
  {
    step: 3,
    title: 'We Craft Your Outfit',
    description: 'Our artisans meticulously stitch your outfit with care.',
  },
  {
    step: 4,
    title: 'Delivered to You',
    description: 'Your bespoke creation, delivered safely to your doorstep.',
  },
] as const;

// --- Brand Promises ---

export const BRAND_PROMISES = [
  {
    icon: 'scissors' as const,
    title: 'Custom Made',
    subtitle: 'Just for You',
  },
  {
    icon: 'fabric' as const,
    title: 'Premium Fabrics',
    subtitle: 'Handpicked',
  },
  {
    icon: 'heart' as const,
    title: 'Crafted with Love',
    subtitle: 'By Fasna',
  },
  {
    icon: 'shipping' as const,
    title: 'Worldwide',
    subtitle: 'Shipping',
  },
] as const;

// --- Currency ---

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol} ${amount.toLocaleString(CURRENCY.locale)}`;
}
