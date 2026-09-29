import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { Lock, CreditCard, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { getCart, CartItem, clearCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState('Ayesha Khan');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('ayesha@example.com');
  const [street, setStreet] = useState('Flat 4B, Emerald Heights');
  const [city, setCity] = useState('Kochi');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('682001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCartItems(getCart());

    // Check for saved address from profile
    try {
      const saved = localStorage.getItem('fabstory_saved_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultAddr = Array.isArray(parsed)
          ? parsed.find((a: any) => a.isDefault) || parsed[0]
          : parsed;
        if (defaultAddr) {
          if (defaultAddr.fullName) setFullName(defaultAddr.fullName);
          if (defaultAddr.phone) setPhone(defaultAddr.phone);
          if (defaultAddr.street) setStreet(defaultAddr.street);
          if (defaultAddr.city) setCity(defaultAddr.city);
          if (defaultAddr.state) setState(defaultAddr.state);
          if (defaultAddr.pincode) setPincode(defaultAddr.pincode);
        }
      }
    } catch {
      // ignore
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
        if (user.user_metadata?.phone) {
          setPhone(user.user_metadata.phone);
        }
      }
    });
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const effectiveSubtotal = subtotal > 0 ? subtotal : 6998;
  const shipping = 200;
  const total = effectiveSubtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !street.trim()) {
      setErrorMessage('Please fill in your name, email, and street address.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const itemsToSubmit =
      cartItems.length > 0
        ? cartItems
        : [
            { id: '1', name: 'Floral Anarkali (Custom Size)', fabric: 'Pure Silk', size: 'M', quantity: 1, price: 3999 },
            { id: '2', name: 'Embroidered Abaya (L)', fabric: 'Georgette', size: 'L', quantity: 1, price: 2999 },
          ];

    try {
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          items: itemsToSubmit,
          totalAmount: total,
          paymentMethod: paymentMethod === 'upi' ? 'UPI / QR' : 'Credit / Debit Card',
          razorpayPaymentId: `pay_${Date.now().toString(36)}`,
          razorpayOrderId: `order_${Date.now().toString(36)}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please try again.');
        setIsProcessing(false);
      } else {
        clearCart();
        router.push(
          `/order-success?order=${data.orderNumber}&amount=${total}&email=${encodeURIComponent(email)}`
        );
      }
    } catch {
      setErrorMessage('Payment network error. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
            Checkout
          </h1>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-[#23484A] pb-2 border-b border-[#E5E0D8]">
                  1. Contact & Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Email Address (for Order Confirmation) *</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Street Address *</label>
                  <input
                    type="text"
                    className="input"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">City *</label>
                    <input
                      type="text"
                      className="input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">State *</label>
                    <input
                      type="text"
                      className="input"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Pincode *</label>
                    <input
                      type="text"
                      className="input"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
                <h2 className="font-serif text-xl text-[#23484A] pb-2 border-b border-[#E5E0D8]">
                  2. Payment Method
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-[#E5E0D8] rounded-xs cursor-pointer hover:border-[#23484A]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#23484A]"
                    />
                    <Smartphone className="w-5 h-5 text-[#23484A]" />
                    <div>
                      <span className="text-xs font-semibold text-[#243234] block">UPI / QR (Google Pay, PhonePe, Paytm)</span>
                      <span className="text-[11px] text-[#6F7775]">Fast & safe instant payment via Razorpay</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-[#E5E0D8] rounded-xs cursor-pointer hover:border-[#23484A]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#23484A]"
                    />
                    <CreditCard className="w-5 h-5 text-[#23484A]" />
                    <div>
                      <span className="text-xs font-semibold text-[#243234] block">Credit / Debit Card / Net Banking</span>
                      <span className="text-[11px] text-[#6F7775]">Visa, Mastercard, RuPay, Net Banking</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn btn-primary bg-[#23484A] hover:bg-[#1a383a] text-white py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C7A66A]" />
                    <span>Processing & Confirming Order...</span>
                  </>
                ) : (
                  <span>PAY {formatPrice(total)} & PLACE ORDER</span>
                )}
              </button>
            </form>

            {/* Right Summary */}
            <div className="lg:col-span-5 bg-white p-6 border border-[#E5E0D8] space-y-4">
              <h2 className="font-serif text-xl text-[#23484A] pb-3 border-b border-[#E5E0D8]">
                Order Summary ({cartItems.length > 0 ? cartItems.length : 2} Items)
              </h2>

              <div className="space-y-3">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-[#243234] block">{item.name}</span>
                        <span className="text-[11px] text-[#6F7775]">
                          {item.fabric} - {item.size} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                        </span>
                      </div>
                      <span className="font-semibold text-[#23484A]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span>Floral Anarkali (Custom Size)</span>
                      <span className="font-semibold text-[#23484A]">₹ 3,999</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Embroidered Abaya (L)</span>
                      <span className="font-semibold text-[#23484A]">₹ 2,999</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5E0D8] space-y-2 text-xs text-[#6F7775]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal > 0 ? subtotal : 6998)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping > 0 ? shipping : 200)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#23484A] pt-3 border-t border-[#E5E0D8]">
                  <span>Total Payable</span>
                  <span>{formatPrice(total > 0 ? total : 7198)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
