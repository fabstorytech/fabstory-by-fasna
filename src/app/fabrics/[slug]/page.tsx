'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { MOCK_FABRICS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function FabricDetailPage() {
  const fabric = MOCK_FABRICS[0];
  const [meters, setMeters] = useState(2);

  const totalPrice = fabric.pricePerMeter * meters;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A]">Home</Link>
            <span>›</span>
            <Link href="/fabrics" className="hover:text-[#23484A]">Fabrics</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">{fabric.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Fabric Image */}
            <div className="lg:col-span-6 bg-white p-4 border border-[#E5E0D8]">
              <div className="relative aspect-[4/3] w-full bg-[#F8F5EF] overflow-hidden">
                <Image
                  src={fabric.images[0]?.url || '/images/products/product-3.jpg'}
                  alt={fabric.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-6 bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A] block">
                  {fabric.material} MATERIAL
                </span>
                <h1 className="font-serif text-3xl text-[#23484A] mt-1">{fabric.name}</h1>
                <div className="mt-2 text-lg font-semibold text-[#23484A]">
                  {formatPrice(fabric.pricePerMeter)}{' '}
                  <span className="text-xs font-normal text-[#6F7775]">per meter</span>
                </div>
              </div>

              <p className="text-xs text-[#6F7775] leading-relaxed border-t border-b border-[#E5E0D8] py-4">
                {fabric.description}
              </p>

              {/* Quantity in Meters */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#243234]">
                  Quantity (Meters)
                </label>
                <div className="flex items-center border border-[#E5E0D8] w-36 bg-white">
                  <button
                    onClick={() => setMeters(Math.max(1, meters - 1))}
                    className="p-2 text-[#243234] hover:bg-[#F8F5EF]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-xs font-semibold text-[#243234]">
                    {meters} meter{meters > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setMeters(meters + 1)}
                    className="p-2 text-[#243234] hover:bg-[#F8F5EF]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between text-sm">
                <span className="text-[#6F7775]">Total Price:</span>
                <span className="font-bold text-[#23484A] text-lg">{formatPrice(totalPrice)}</span>
              </div>

              <Link
                href="/cart"
                className="w-full btn btn-primary bg-[#23484A] text-white py-3.5 text-xs font-semibold uppercase tracking-wider block text-center"
              >
                ADD FABRIC TO CART
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
