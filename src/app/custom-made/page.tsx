'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function CustomMadeRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                  Thank you for reaching out. Fasna will review your design requirements and get back to you via WhatsApp / Email within 24 hours.
                </p>
                <Link href="/" className="btn btn-primary bg-[#23484A] text-white mt-4 inline-block">
                  RETURN TO HOME
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input type="text" required placeholder="Ayesha Khan" className="input" />
                  </div>
                  <div>
                    <label className="input-label">Phone Number / WhatsApp *</label>
                    <input type="tel" required placeholder="+91 98765 43210" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Email Address *</label>
                    <input type="email" required placeholder="ayesha@example.com" className="input" />
                  </div>
                  <div>
                    <label className="input-label">Approximate Budget (₹)</label>
                    <select className="input select">
                      <option value="2000-4000">₹ 2,000 – ₹ 4,000</option>
                      <option value="4000-7000">₹ 4,000 – ₹ 7,000</option>
                      <option value="7000-12000">₹ 7,000 – ₹ 12,000</option>
                      <option value="12000+">Above ₹ 12,000</option>
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
                  />
                </div>

                <div>
                  <label className="input-label">Upload Reference Image (Optional)</label>
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E5E0D8] bg-[#F8F5EF] hover:border-[#23484A] transition-colors rounded-xs cursor-pointer">
                    <Upload className="w-8 h-8 text-[#23484A] mb-2" />
                    <span className="text-xs font-semibold text-[#23484A]">
                      Click to upload design sketch or reference photo
                    </span>
                    <span className="text-[11px] text-[#6F7775] mt-1">
                      PNG, JPG up to 10MB
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn btn-primary bg-[#23484A] text-white py-3.5 text-xs font-semibold uppercase tracking-wider"
                >
                  REQUEST A CUSTOM QUOTE
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
