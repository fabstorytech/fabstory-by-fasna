'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Fabric } from '@/types';
import { getFabrics } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Layers, ShoppingBag } from 'lucide-react';

interface FabricPageProps {
  params: Promise<{ slug: string }>;
}

export default function FabricDetailPage({ params }: FabricPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [meters, setMeters] = useState(2);

  useEffect(() => {
    setLoading(true);
    getFabrics().then((allFabrics) => {
      if (allFabrics && allFabrics.length > 0) {
        const found = allFabrics.find((f) => f.slug === slug);
        setFabric(found || allFabrics[0]);
      } else {
        setFabric(null);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6F7775]">Loading fabric details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!fabric) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-4 max-w-md bg-white p-8 border border-[#E5E0D8]">
            <Layers className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
            <h2 className="font-serif text-xl text-[#23484A]">Fabric Not Found</h2>
            <p className="text-xs text-[#6F7775]">The requested fabric material is not available in the database.</p>
            <Link href="/fabrics" className="btn bg-[#23484A] text-white text-xs font-semibold px-6 py-2.5 inline-block">
              BROWSE FABRICS
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pricePerMeter = fabric.pricePerMeter || 599;
  const totalPrice = pricePerMeter * meters;
  const fabricImage = fabric.images && fabric.images.length > 0 ? fabric.images[0].url : '/images/placeholder.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-6 sm:space-y-8">
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
                  src={fabricImage}
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
                  {fabric.material || 'COTTON'} MATERIAL
                </span>
                <h1 className="font-serif text-3xl text-[#23484A] mt-1">{fabric.name}</h1>
                <div className="mt-2 text-lg font-semibold text-[#23484A]">
                  {formatPrice(pricePerMeter)}{' '}
                  <span className="text-xs font-normal text-[#6F7775]">per meter</span>
                </div>
              </div>

              <p className="text-xs text-[#6F7775] leading-relaxed border-t border-b border-[#E5E0D8] py-4">
                {fabric.description || 'Premium handpicked luxury fabric curated for custom tailoring and bespoke design.'}
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
                className="w-full btn bg-[#23484A] text-white py-3.5 text-xs font-semibold uppercase tracking-wider block text-center hover:bg-[#1A3536]"
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
