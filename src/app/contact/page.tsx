'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { BRAND } from '@/lib/constants';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              GET IN TOUCH
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              We&apos;d Love to Hear From You
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775] max-w-lg mx-auto">
              Have a question about measurements, fabrics, or an order? Reach out to us.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 bg-white p-8 border border-[#E5E0D8] space-y-6">
              <h2 className="font-serif text-2xl text-[#23484A]">Contact Information</h2>
              <div className="space-y-4 text-xs text-[#6F7775]">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#23484A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#243234] block">Phone / WhatsApp</span>
                    <span>{BRAND.phone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#23484A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#243234] block">Email</span>
                    <span>{BRAND.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#23484A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#243234] block">Location</span>
                    <span>{BRAND.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7 bg-white p-8 border border-[#E5E0D8]">
              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#23484A] mx-auto" />
                  <h3 className="font-serif text-xl text-[#23484A]">Message Sent Successfully</h3>
                  <p className="text-xs text-[#6F7775]">We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Name *</label>
                      <input type="text" required className="input" placeholder="Your Name" />
                    </div>
                    <div>
                      <label className="input-label">Email *</label>
                      <input type="email" required className="input" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Subject</label>
                    <input type="text" className="input" placeholder="Inquiry about custom order" />
                  </div>
                  <div>
                    <label className="input-label">Message *</label>
                    <textarea required rows={4} className="input" placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className="btn btn-primary bg-[#23484A] text-white py-3 text-xs uppercase">
                    SEND MESSAGE
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
