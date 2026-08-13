import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              SIMPLE PROCESS
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              How Custom Tailoring Works
            </h1>
            <p className="text-xs md:text-sm text-[#6F7775] max-w-lg mx-auto">
              From design selection to your doorstep in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((s) => (
              <div key={s.step} className="bg-white p-6 border border-[#E5E0D8] space-y-3 relative">
                <span className="font-serif text-4xl font-bold text-[#C7A66A]/40 block">
                  0{s.step}
                </span>
                <h3 className="font-serif text-xl text-[#23484A]">{s.title}</h3>
                <p className="text-xs text-[#6F7775] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
