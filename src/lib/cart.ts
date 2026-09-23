// ============================================================
// Fabstory by Fasna — Cart Management & Persistence Utility
// ============================================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  fabric: string;
  size: string;
  customSize: boolean;
  price: number;
  quantity: number;
  image: string;
  measurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    shoulder?: string;
    sleeveLength?: string;
    outfitLength?: string;
    notes?: string;
  };
}

const CART_STORAGE_KEY = 'fabstory_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
}

export function addToCart(item: Omit<CartItem, 'id'>): CartItem {
  const current = getCart();
  const existingIdx = current.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.fabric === item.fabric &&
      i.size === item.size &&
      !i.customSize
  );

  let updated: CartItem[];
  let finalItem: CartItem;

  if (existingIdx > -1 && !item.customSize) {
    updated = [...current];
    updated[existingIdx].quantity += item.quantity;
    finalItem = updated[existingIdx];
  } else {
    finalItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    updated = [finalItem, ...current];
  }

  saveCart(updated);
  return finalItem;
}

export function updateCartQuantity(id: string, delta: number): void {
  const current = getCart();
  const updated = current
    .map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    })
    .filter(Boolean) as CartItem[];

  saveCart(updated);
}

export function removeFromCart(id: string): void {
  const current = getCart();
  const updated = current.filter((item) => item.id !== id);
  saveCart(updated);
}

export function clearCart(): void {
  saveCart([]);
}
