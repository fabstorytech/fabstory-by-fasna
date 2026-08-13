import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { BRAND } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-narrow space-y-12">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              OUR JOURNEY
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              The Story of Fabstory
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775] max-w-lg mx-auto">
              Behind every outfit is a passion for craftsmanship, personal style, and timeless elegance.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden border border-[#E5E0D8] shadow-sm">
            <Image src="/images/about.jpg" alt="Fabstory by Fasna story" fill className="object-cover" />
          </div>

          {/* Story Content */}
          <div className="bg-white p-8 md:p-12 border border-[#E5E0D8] space-y-6 text-sm text-[#6F7775] leading-relaxed">
            <h2 className="font-serif text-2xl text-[#23484A]">
              &quot;Sewing fabulous stories, one outfit at a time.&quot;
            </h2>
            <p>
              Founded by Fasna, <strong>Fabstory</strong> was born out of a desire to create clothing that fits every woman&apos;s unique shape, style, and identity. We believe that true fashion shouldn&apos;t be mass-produced — it should be as individual as you are.
            </p>
            <p>
              From custom-tailored Anarkalis and Abayas to handpicked premium cottons, linens, and silks, our studio in Kerala crafts every garment with meticulous attention to detail and love.
            </p>
            <p>
              Whether you choose from our Ready-to-Ship collection or design a fully custom outfit with personalized measurements, we ensure every stitch reflects quality, comfort, and grace.
            </p>
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
