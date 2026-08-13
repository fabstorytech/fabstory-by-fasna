// ============================================================
// Fabstory by Fasna — Core Type Definitions
// ============================================================

// --- Product Types ---

export type ProductType = 'CUSTOM' | 'READY_STOCK' | 'FABRIC';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  type: ProductType;
  status: ProductStatus;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  sizes: string[];
  fabrics: FabricOption[];
  isFeatured: boolean;
  stock: number;
  sku?: string;
  careInstructions?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FabricOption {
  id: string;
  fabricId: string;
  fabric?: Fabric;
  name: string;
  additionalPrice: number;
}

// --- Category Types ---

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  order: number;
}

// --- Fabric Types ---

export type FabricMaterial =
  | 'Cotton'
  | 'Linen'
  | 'Silk'
  | 'Chiffon'
  | 'Georgette'
  | 'Organza'
  | 'Crepe'
  | 'Velvet'
  | 'Satin';

export interface Fabric {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePerMeter: number;
  material: FabricMaterial;
  color: string;
  colorHex?: string;
  stock: number;
  images: ProductImage[];
  careInstructions?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Measurement Types ---

export interface MeasurementField {
  key: string;
  label: string;
  unit: 'inches' | 'cm';
  placeholder?: string;
  required: boolean;
}

export interface Measurements {
  bust?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  sleeveLength?: number;
  outfitLength?: number;
  neck?: number;
  armhole?: number;
  [key: string]: number | undefined;
}

// --- Cart Types ---

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedFabric?: FabricOption;
  customMeasurements?: Measurements;
  specialInstructions?: string;
  referenceImageUrl?: string;
  isCustom: boolean;
  unitPrice: number;
  customizationCharges: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

// --- Order Types ---

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'ORDER_CONFIRMED'
  | 'MEASUREMENTS_VERIFIED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'REFUNDED'
  | 'FAILED';

export type PaymentMode = 'FULL_PAYMENT' | 'ADVANCE_PAYMENT';

export interface OrderStatusEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  fabricName?: string;
  measurements?: Measurements;
  specialInstructions?: string;
  referenceImageUrl?: string;
  isCustom: boolean;
  unitPrice: number;
  customizationCharges: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  phone: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMode: PaymentMode;
  advanceAmount?: number;
  remainingAmount?: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusEntry[];
  trackingNumber?: string;
  courier?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Address Types ---

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// --- User / Profile Types ---

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  addresses: Address[];
  createdAt: string;
}

// --- Custom Request Types ---

export interface CustomRequest {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  referenceImageUrl?: string;
  preferredFabric?: string;
  approximateBudget?: string;
  measurements?: Measurements;
  status: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Review Types ---

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// --- Wishlist Types ---

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// --- Navigation Types ---

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// --- Testimonial Types ---

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  productName?: string;
}
