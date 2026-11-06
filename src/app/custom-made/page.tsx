'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { openWhatsApp } from '@/lib/whatsapp';

export default function CustomMadeRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('₹ 2,000 – ₹ 4,000');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const waMessage =
      `*New Bespoke Outfit Inquiry — Fabstory by Fasna*\n\n` +
      `*Customer Name:* ${fullName}\n` +
      `*Phone / WhatsApp:* ${phone}\n` +
      `*Email:* ${email}\n` +
      `*Approximate Budget:* ${budget}\n\n` +
      `*Outfit Design Description:*\n${description}\n\n` +
      `Hi Fasna, I would like to consult on this custom design and share my reference inspiration photos directly here.`;

    openWhatsApp(BRAND.whatsappNumber, waMessage);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-narrow space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              BESPOKE TAILORING
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              Request a Custom Outfit
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775] max-w-lg mx-auto">
              Have a design idea or reference picture? Share your inspiration with Fasna and let us stitch your fabulous story.
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 border border-[#E5E0D8] shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#23484A] mx-auto" />
                <h2 className="font-serif text-2xl text-[#23484A]">
                  Custom Quote Request Submitted!
                </h2>
                <p className="text-xs text-[#6F7775] max-w-md mx-auto">
                  Thank you for reaching out. We have connected you to WhatsApp. You can share your design sketches and reference photos directly in the chat with Fasna.
                </p>
                <div className="flex items-center justify-center gap-3 pt-3">
                  <Link href="/" className="btn btn-primary bg-[#23484A] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider inline-block">
                    RETURN TO HOME
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ayesha Khan"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone Number / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ayesha@example.com"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Approximate Budget (₹)</label>
                    <select
                      className="input select"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      <option value="₹ 2,000 – ₹ 4,000">₹ 2,000 – ₹ 4,000</option>
                      <option value="₹ 4,000 – ₹ 7,000">₹ 4,000 – ₹ 7,000</option>
                      <option value="₹ 7,000 – ₹ 12,000">₹ 7,000 – ₹ 12,000</option>
                      <option value="Above ₹ 12,000">Above ₹ 12,000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Describe Your Outfit Idea *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the silhouette, neckline, sleeve length, embroidery preferences, or any specific details..."
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Direct WhatsApp Reference Photo Note (No File Upload to Cloud Storage) */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#243234] block">
                      Share Design Sketches & Reference Photos on WhatsApp
                    </span>
                    <p className="text-[11px] text-[#6F7775] leading-relaxed">
                      To keep design consultations personal and instant, you can send any Pinterest pictures, sketches, or screenshot references directly in your WhatsApp chat with Fasna.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn bg-[#23484A] hover:bg-[#1A3536] text-white py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#C7A66A]" />
                  <span>REQUEST A CUSTOM QUOTE VIA WHATSAPP</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
