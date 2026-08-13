import { Scissors, Layers, Heart, Globe } from 'lucide-react';

export default function BrandPromises() {
  const promises = [
    {
      icon: Scissors,
      title: 'Custom Made',
      subtitle: 'Just for You',
    },
    {
      icon: Layers,
      title: 'Premium Fabrics',
      subtitle: 'Handpicked',
    },
    {
      icon: Heart,
      title: 'Made with Love',
      subtitle: 'By Fasna',
    },
    {
      icon: Globe,
      title: 'Worldwide',
      subtitle: 'Shipping',
    },
  ];

  return (
    <section className="bg-[#F8F5EF] border-t border-b border-[#E5E0D8] py-8">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8]">
          {promises.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-center gap-3.5 pt-3 md:pt-0 first:pt-0 px-3"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#C7A66A]/40 flex items-center justify-center text-[#23484A] shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#23484A] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6F7775] mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
