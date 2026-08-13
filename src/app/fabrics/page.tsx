'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Fabric } from '@/types';
import { getFabrics } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';
import { Layers, Plus } from 'lucide-react';

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    getFabrics().then((data) => {
      setFabrics(data || []);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
              PREMIUM MATERIAL
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              Fabrics by the Meter
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775] mt-1">
              Handpicked luxury fabrics curated for your bespoke tailoring needs.
            </p>
          </div>

          {loaded && fabrics.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white border border-[#E5E0D8] space-y-4">
              <Layers className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-[#23484A]">No fabrics uploaded to catalog</h3>
                <p className="text-xs text-[#6F7775]">Upload fabric samples from your Admin Panel.</p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 bg-[#23484A] text-white text-xs font-semibold px-4 py-2.5 rounded-xs shadow-2xs hover:bg-[#1A3536]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fabrics in Admin</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fabrics.map((fabric) => (
                <div key={fabric.id} className="group bg-white border border-[#E5E0D8] flex flex-col overflow-hidden hover:border-[#23484A]/40 transition-all">
                  <Link href={`/fabrics/${fabric.slug}`} className="relative aspect-[4/3] bg-[#F8F5EF] overflow-hidden">
                    <Image
                      src={fabric.images[0]?.url || '/images/placeholder.jpg'}
                      alt={fabric.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-[#C7A66A] text-white px-2 py-0.5 rounded-xs">
                      {fabric.material}
                    </span>
                  </Link>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[#243234] group-hover:text-[#23484A] transition-colors">
                        {fabric.name}
                      </h3>
                      <p className="text-xs text-[#6F7775] line-clamp-2 mt-1">{fabric.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#6F7775] block text-[10px] uppercase">Price per metre</span>
                        <span className="text-sm font-semibold text-[#23484A]">
                          {formatPrice(fabric.pricePerMeter)}
                        </span>
                      </div>

                      <Link
                        href={`/fabrics/${fabric.slug}`}
                        className="btn btn-sm btn-secondary text-[11px] py-1 px-3 border-[#23484A] text-[#23484A]"
                      >
                        SELECT
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
