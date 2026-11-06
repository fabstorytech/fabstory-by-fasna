'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import {
  Lock,
  CreditCard,
  Smartphone,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  MessageCircle,
  Scissors,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { getCart, CartItem, clearCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase/client';
import { loadRazorpayScript, RazorpayOptions, RazorpayResponse } from '@/lib/razorpay';
import { BRAND } from '@/lib/constants';
import { openWhatsApp } from '@/lib/whatsapp';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentOption, setPaymentOption] = useState<'online' | 'consultation'>('online');
  const [fullName, setFullName] = useState('Ayesha Khan');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('ayesha@example.com');
  const [street, setStreet] = useState('Flat 4B, Emerald Heights');
  const [city, setCity] = useState('Kochi');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('682001');
  const [customNotes, setCustomNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const items = getCart();
    setCartItems(items);

    // If any item has custom size, open notes accordion and set consultation flow
    if (items.some((i) => i.customSize || i.productType === 'CUSTOM')) {
      setShowNotes(true);
      setPaymentOption('consultation');
    } else {
      setPaymentOption('online');
    }

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

  const itemsToSubmit =
    cartItems.length > 0
      ? cartItems
      : [
          {
            id: '1',
            productId: 'demo-1',
            name: 'Floral Anarkali Suit',
            slug: 'floral-anarkali',
            fabric: 'Pure Silk',
            size: 'M',
            customSize: false,
            productType: 'READY_STOCK' as const,
            quantity: 1,
            price: 3999,
            image: '/images/products/product-1.jpg',
          },
          {
            id: '2',
            productId: 'demo-2',
            name: 'Embroidered Kurti Set',
            slug: 'embroidered-kurti',
            fabric: 'Georgette',
            size: 'L',
            customSize: false,
            productType: 'READY_STOCK' as const,
            quantity: 1,
            price: 2999,
            image: '/images/products/product-2.jpg',
          },
        ];

  const hasCustomItems = itemsToSubmit.some((i) => i.customSize || i.productType === 'CUSTOM');

  // ============================================================
  // ONLINE PAYMENT HANDLER
  // ============================================================
  const handleOnlinePayment = async () => {
    if (!fullName.trim() || !email.trim() || !street.trim()) {
      setErrorMessage('Please complete your name, email, and delivery address.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Load payment checkout script seamlessly
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMessage('Unable to initialize secure checkout. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // 2. Create order on server
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          orderType: hasCustomItems ? 'CUSTOM' : 'READY_STOCK',
          receipt: `rcpt_${Date.now().toString(36)}`,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.success) {
        setErrorMessage(orderData.error || 'Failed to initialize secure checkout.');
        setIsProcessing(false);
        return;
      }

      // 3. Launch Checkout Modal
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Fabstory by Fasna',
        description: 'Order Payment',
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response: RazorpayResponse) {
          try {
            // 4. Verify & Confirm Order
            const verifyRes = await fetch('/api/checkout/verify-payment', {
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
                paymentMethod: 'Online Payment (UPI / Cards / NetBanking)',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderType: hasCustomItems ? 'CUSTOM' : 'READY_STOCK',
                notes: customNotes,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              clearCart();
              router.push(
                `/order-success?order=${verifyData.orderNumber}&amount=${total}&email=${encodeURIComponent(
                  email
                )}&payment_id=${response.razorpay_payment_id}`
              );
            } else {
              setErrorMessage(verifyData.error || 'Order recorded, redirecting...');
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Order confirmation error:', err);
            setErrorMessage('Network error during order confirmation.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        notes: {
          shipping_address: `${street}, ${city}, ${state} - ${pincode}`,
        },
        theme: {
          color: '#23484A',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (failResponse: any) {
        console.error('Payment Failed:', failResponse);
        setErrorMessage(
          failResponse.error?.description || 'Payment was unsuccessful or cancelled. Please try again.'
        );
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err?.message || 'Secure payment initialization failed.');
      setIsProcessing(false);
    }
  };

  // ============================================================
  // WHATSAPP BESPOKE CONSULTATION ORDER
  // ============================================================
  const handleConsultationOrder = async () => {
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Please provide your name and phone number for WhatsApp consultation.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim() || 'inquiry@fabstorybyfasna.com',
          customerPhone: phone.trim(),
          shippingAddress: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          items: itemsToSubmit,
          totalAmount: total,
          paymentMethod: 'Bespoke Order Consultation',
          orderType: 'CUSTOM',
          notes: customNotes,
        }),
      });

      const data = await res.json();
      const orderNumber = data?.orderNumber || `CUST-${Date.now().toString().slice(-5)}`;

      const itemsListText = itemsToSubmit
        .map((i) => `• *${i.name}* (${i.fabric || 'Selected Fabric'}, Size: ${i.size}, Qty: ${i.quantity})`)
        .join('\n');

      const waMessage =
        `*New Bespoke Order Inquiry — Fabstory by Fasna*\n\n` +
        `*Order Reference:* #${orderNumber}\n` +
        `*Customer Name:* ${fullName}\n` +
        `*Phone / WhatsApp:* ${phone}\n` +
        `*Delivery Address:* ${street}, ${city}, ${state} - ${pincode}\n\n` +
        `*Items:*\n${itemsListText}\n\n` +
        `*Order Total:* ${formatPrice(total)}\n` +
        (customNotes ? `*Special Measurements / Notes:* ${customNotes}\n\n` : '\n') +
        `Hi Fasna, please review my order request so we can confirm measurements and fabric details.`;

      clearCart();
      openWhatsApp(BRAND.whatsappNumber, waMessage);
      router.push(`/order-success?order=${orderNumber}&amount=${total}&email=${encodeURIComponent(email)}`);
    } catch {
      setErrorMessage('Failed to submit order request. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentOption === 'online') {
      handleOnlinePayment();
    } else {
      handleConsultationOrder();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#243234]">
      <Header />

      <main className="flex-1 section-padding py-8 sm:py-12">
        <div className="container-main max-w-6xl space-y-8">
          
          {/* Top Heading */}
          <div className="border-b border-[#E5E0D8] pb-5">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#C7A66A] font-semibold block">
              SECURE CHECKOUT
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#23484A] font-medium mt-1">
              Delivery & Payment
            </h1>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ============================================================ */}
            {/* LEFT COLUMN: Customer Info, Shipping & Payment Method        */}
            {/* ============================================================ */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Contact & Delivery Address */}
              <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <h2 className="font-serif text-xl sm:text-2xl text-[#23484A] font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#23484A] text-white text-xs font-sans font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Shipping Address</span>
                  </h2>
                  <span className="text-[11px] text-[#6F7775]">All fields required *</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label text-xs font-semibold text-[#243234]">Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label text-xs font-semibold text-[#243234]">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label text-xs font-semibold text-[#243234]">Email Address *</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <span className="text-[10px] text-[#6F7775] mt-1 block">
                    Your digital receipt and delivery tracking updates will be sent here.
                  </span>
                </div>

                <div>
                  <label className="input-label text-xs font-semibold text-[#243234]">Street Address *</label>
                  <input
                    type="text"
                    className="input"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat / House No., Building Name, Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="input-label text-xs font-semibold text-[#243234]">City *</label>
                    <input
                      type="text"
                      className="input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label text-xs font-semibold text-[#243234]">State *</label>
                    <input
                      type="text"
                      className="input"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label text-xs font-semibold text-[#243234]">Pincode *</label>
                    <input
                      type="text"
                      className="input"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Collapsible Tailoring / Custom Measurement Notes */}
                <div className="pt-2 border-t border-[#E5E0D8]/60">
                  <button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-xs font-medium text-[#23484A] hover:text-[#C7A66A] flex items-center justify-between w-full py-1 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Scissors className="w-3.5 h-3.5 text-[#C7A66A]" />
                      <span>Add Bespoke Measurements or Tailoring Notes (Optional)</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showNotes ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showNotes && (
                    <div className="pt-3 space-y-1.5 animate-fade-in">
                      <textarea
                        rows={3}
                        className="input text-xs"
                        placeholder="Provide any specific sizing requests (e.g. Bust: 34, Waist: 28, Length: 52 inches, custom neckline preference)..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                      />
                      <span className="text-[10px] text-[#6F7775] block">
                        Our tailoring team will review and verify these before cutting the fabric.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Payment or Customization Section (Strict Gated Flow) */}
              {hasCustomItems ? (
                /* Bespoke Consultation & Order Confirmation Flow (Customized Pieces) */
                <div className="bg-white rounded-xl border border-emerald-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="border-b border-[#E5E0D8] pb-3 flex items-center justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#23484A] font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1B7F5E] text-white text-xs font-sans font-bold flex items-center justify-center">
                        2
                      </span>
                      <span>Bespoke Order Confirmation</span>
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      Customized Order
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-emerald-200/80 rounded-xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-[#243234]">
                          WhatsApp Consultation with Designer Fasna
                        </h3>
                        <p className="text-xs text-[#6F7775] leading-relaxed">
                          This order includes custom-tailored pieces or bespoke sizing. Because every garment is handcrafted to your exact silhouette, payment is not collected online right now.
                        </p>
                      </div>
                    </div>

                    {/* 3 Step Workflow */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E5E0D8]/70 text-xs">
                      <div className="bg-white p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                        <span className="text-[10px] font-bold text-[#C7A66A] uppercase block">Step 1</span>
                        <p className="text-[11px] text-[#243234] font-medium leading-snug">Submit your address & measurement notes</p>
                      </div>
                      <div className="bg-white p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Step 2</span>
                        <p className="text-[11px] text-[#243234] font-medium leading-snug">Connect directly with Fasna on WhatsApp</p>
                      </div>
                      <div className="bg-white p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                        <span className="text-[10px] font-bold text-[#23484A] uppercase block">Step 3</span>
                        <p className="text-[11px] text-[#243234] font-medium leading-snug">Confirm tailoring details & delivery schedule</p>
                      </div>
                    </div>
                  </div>

                  {/* Primary WhatsApp CTA Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#1B7F5E] hover:bg-[#156349] text-white py-4 px-6 rounded-md font-semibold text-xs tracking-[0.14em] uppercase transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2.5 mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Submitting Bespoke Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Confirm & Order via WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Instant Online Payment Flow (Ready to Ship Pieces) */
                <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="border-b border-[#E5E0D8] pb-3 flex items-center justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#23484A] font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#23484A] text-white text-xs font-sans font-bold flex items-center justify-center">
                        2
                      </span>
                      <span>Payment Method</span>
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#718887]">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-[#23484A] bg-[#FAF8F5] ring-1 ring-[#23484A] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#243234]">
                        Instant Online Payment
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                        Fast & Secure
                      </span>
                    </div>
                    <p className="text-xs text-[#6F7775] leading-relaxed">
                      All items in this order are in stock and ready to ship. Pay securely with Google Pay, PhonePe, Paytm, Any UPI App, Credit & Debit Cards, or Net Banking.
                    </p>

                    {/* Supported Payment Logos / Badges */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="px-2 py-1 bg-white border border-[#E5E0D8] text-[10px] font-bold text-[#243234] rounded-xs shadow-2xs">
                        UPI / QR
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#E5E0D8] text-[10px] font-bold text-[#243234] rounded-xs shadow-2xs">
                        Google Pay
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#E5E0D8] text-[10px] font-bold text-[#243234] rounded-xs shadow-2xs">
                        PhonePe
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#E5E0D8] text-[10px] font-bold text-[#243234] rounded-xs shadow-2xs">
                        Visa / Master
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#E5E0D8] text-[10px] font-bold text-[#243234] rounded-xs shadow-2xs">
                        Net Banking
                      </span>
                    </div>
                  </div>

                  {/* Primary Online Payment CTA Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#23484A] hover:bg-[#1A3536] text-white py-4 px-6 rounded-md font-semibold text-xs tracking-[0.14em] uppercase transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C7A66A]" />
                        <span>Processing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay {formatPrice(total)} & Complete Order</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: Order Summary (Boutique Style)                 */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3.5">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#23484A] font-medium">
                    Order Summary
                  </h3>
                  <span className="text-xs text-[#6F7775]">
                    {itemsToSubmit.length} {itemsToSubmit.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#E5E0D8]/70 max-h-80 overflow-y-auto pr-1">
                  {itemsToSubmit.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-18 bg-[#FAF8F5] rounded-xs border border-[#E5E0D8] overflow-hidden shrink-0">
                          <Image
                            src={item.image || '/images/placeholder.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover object-top"
                          />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#243234] truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#6F7775]">
                            {item.fabric && <span>{item.fabric} • </span>}
                            <span>Size: {item.size}</span>
                          </p>
                          <span className="text-[10px] text-[#718887] block">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-[#23484A] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-[#E5E0D8] pt-4 space-y-2.5 text-xs text-[#6F7775]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#243234] font-medium">{formatPrice(effectiveSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Insured Delivery</span>
                    <span className="text-[#243234] font-medium">{formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t border-[#E5E0D8] pt-3 flex justify-between items-baseline text-base sm:text-lg font-bold text-[#23484A]">
                    <span>Total Payable</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Boutique Reassurance */}
                <div className="pt-4 border-t border-[#E5E0D8] space-y-2 text-xs text-[#6F7775]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#23484A] shrink-0" />
                    <span>Dispatched in 24–48 Hours for In-Stock Pieces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C7A66A] shrink-0" />
                    <span>Double-Finishing & Luxury Hand-Embroidered Detailing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#23484A] shrink-0" />
                    <span>Complimentary Measurement Alteration Support</span>
                  </div>
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
