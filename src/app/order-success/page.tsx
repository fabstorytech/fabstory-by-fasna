'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'FS-8492';
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount ? Number(rawAmount) : 7198;
  const customerEmail = searchParams.get('email');

  return (
    <div className="container-narrow text-center space-y-6">
      <div className="bg-white p-8 md:p-12 border border-[#E5E0D8] space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#23484A]/10 text-[#23484A] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C7A66A] font-semibold block">
            THANK YOU FOR YOUR ORDER
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#23484A] mt-1">
            Order #{orderNumber} Confirmed!
          </h1>
          <p className="text-xs text-[#6F7775] mt-2">
            We have received your payment of {formatPrice(amount)}. Our team will verify your measurements and begin tailoring your outfit.
          </p>
        </div>

        {/* Email Notification Alert */}
        <div className="bg-[#FAF8F5] p-3.5 border border-[#E5E0D8] rounded-xs flex items-center justify-center gap-2 text-xs text-[#23484A]">
          <Mail className="w-4 h-4 text-[#C7A66A] shrink-0" />
          <span>
            Confirmation email has been dispatched
            {customerEmail ? ` to ${customerEmail}` : ''}.
          </span>
        </div>

        <div className="bg-[#F8F5EF] p-4 border border-[#E5E0D8] text-xs text-[#6F7775] space-y-1 text-left max-w-md mx-auto">
          <p>
            <strong className="text-[#243234]">Estimated Delivery:</strong> 7 - 10 Business Days
          </p>
          <p>
            <strong className="text-[#243234]">Tailoring Status:</strong> In Production Queue
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={`/track-order?order=${orderNumber}`}
            className="btn btn-primary bg-[#23484A] text-white px-6 py-3 text-xs font-semibold uppercase"
          >
            TRACK ORDER STATUS
          </Link>
          <Link
            href="/shop"
            className="btn btn-secondary border-[#23484A] text-[#23484A] px-6 py-3 text-xs font-semibold uppercase hover:bg-[#23484A] hover:text-white"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header cartCount={0} />

      <main className="flex-1 section-padding">
        <Suspense fallback={<div className="text-center py-20 text-xs text-[#6F7775]">Loading order details...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
