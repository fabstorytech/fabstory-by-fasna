import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header cartCount={0} />

      <main className="flex-1 section-padding">
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
                Order #FS-8492 Confirmed!
              </h1>
              <p className="text-xs text-[#6F7775] mt-2">
                We have received your payment of ₹ 7,198. Our team will verify your measurements and begin tailoring your outfit.
              </p>
            </div>

            <div className="bg-[#F8F5EF] p-4 border border-[#E5E0D8] text-xs text-[#6F7775] space-y-1 text-left max-w-md mx-auto">
              <p><strong className="text-[#243234]">Delivery Address:</strong> Flat 4B, Emerald Heights, Kochi, Kerala - 682001</p>
              <p><strong className="text-[#243234]">Estimated Delivery:</strong> 7 - 10 Business Days</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/track-order"
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
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
