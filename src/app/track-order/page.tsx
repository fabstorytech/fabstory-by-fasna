'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { Search, CheckCircle2, Clock, PackageCheck, Truck } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('FS-8492');
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(true);

  const timeline = [
    { status: 'ORDER CONFIRMED', done: true, time: '10 Aug 2026, 02:30 PM' },
    { status: 'MEASUREMENTS VERIFIED', done: true, time: '11 Aug 2026, 10:15 AM' },
    { status: 'IN PRODUCTION', done: true, time: '11 Aug 2026, 04:00 PM' },
    { status: 'QUALITY CHECK', done: false, time: 'Expected 13 Aug' },
    { status: 'READY TO SHIP', done: false, time: 'Expected 14 Aug' },
    { status: 'DELIVERED', done: false, time: 'Expected 16 Aug' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-narrow space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              LIVE STATUS
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              Track Your Order
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775]">
              Enter your Order ID and phone number or email to view real-time crafting status.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#E5E0D8] space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); setSearched(true); }} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (e.g. FS-8492)"
                className="input flex-1"
                required
              />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Phone Number"
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary bg-[#23484A] text-white px-6">
                TRACK
              </button>
            </form>
          </div>

          {searched && (
            <div className="bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
                <div>
                  <h2 className="font-serif text-xl text-[#23484A]">Order #{orderId}</h2>
                  <p className="text-xs text-[#6F7775]">Product: Floral Anarkali (Custom Size)</p>
                </div>
                <span className="bg-[#23484A]/10 text-[#23484A] text-xs font-bold px-3 py-1 rounded-xs">
                  IN PRODUCTION
                </span>
              </div>

              {/* Vertical Timeline */}
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D8]">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div
                      className={`absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.done
                          ? 'bg-[#23484A] text-white'
                          : 'bg-[#E5E0D8] text-[#6F7775]'
                      }`}
                    >
                      {item.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className={`font-serif text-sm font-semibold ${item.done ? 'text-[#23484A]' : 'text-[#6F7775]'}`}>
                        {item.status}
                      </h4>
                      <p className="text-[11px] text-[#6F7775]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
