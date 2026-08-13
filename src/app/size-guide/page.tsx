import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-narrow space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              FIT & MEASUREMENTS
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              Size & Measurement Guide
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775]">
              Standard size reference table and custom measurement tips.
            </p>
          </div>

          {/* Standard Size Table */}
          <div className="bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-4 overflow-x-auto">
            <h2 className="font-serif text-xl text-[#23484A]">Standard Size Chart (Inches)</h2>
            <table className="w-full text-left text-xs text-[#243234]">
              <thead>
                <tr className="border-b border-[#E5E0D8] bg-[#F8F5EF] text-[#23484A]">
                  <th className="p-3">Size</th>
                  <th className="p-3">Bust</th>
                  <th className="p-3">Waist</th>
                  <th className="p-3">Hips</th>
                  <th className="p-3">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                <tr><td className="p-3 font-semibold">S (Small)</td><td className="p-3">34&quot;</td><td className="p-3">28&quot;</td><td className="p-3">36&quot;</td><td className="p-3">14&quot;</td></tr>
                <tr><td className="p-3 font-semibold">M (Medium)</td><td className="p-3">36&quot;</td><td className="p-3">30&quot;</td><td className="p-3">38&quot;</td><td className="p-3">14.5&quot;</td></tr>
                <tr><td className="p-3 font-semibold">L (Large)</td><td className="p-3">38&quot;</td><td className="p-3">32&quot;</td><td className="p-3">40&quot;</td><td className="p-3">15&quot;</td></tr>
                <tr><td className="p-3 font-semibold">XL (Extra Large)</td><td className="p-3">40&quot;</td><td className="p-3">34&quot;</td><td className="p-3">42&quot;</td><td className="p-3">15.5&quot;</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
