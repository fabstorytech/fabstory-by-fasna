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
        <div className="container-narrow space-y-8 md:space-y-12">

          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold">
              OUR JOURNEY
            </span>

            <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
              The Story of Fabstory
            </h1>

            <p className="text-xs md:text-sm text-[#6F7775] max-w-lg mx-auto leading-relaxed">
              Behind every outfit is a passion for craftsmanship, personal
              style, and timeless elegance.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-sm overflow-hidden border border-[#E5E0D8] shadow-sm">
            <Image
              src="/images/mobileview/fabstore-aboutpage.png"
              alt="Fabstory by Fasna story"
              fill
              className="object-cover"
            />
          </div>

          {/* Story Content */}
          <div className="bg-white p-4 sm:p-8 md:p-12 border border-[#E5E0D8] space-y-6 md:space-y-8 text-sm text-[#6F7775] leading-relaxed">

            {/* Introduction */}
            <div className="flex items-start gap-3 md:gap-4">
              <div className="shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#F8F5EF] flex items-center justify-center text-[#C7A66A] text-lg md:text-xl">
                ✦
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7A66A] font-semibold">
                  Our Beginning
                </span>

                <h2 className="font-serif text-xl md:text-2xl lg:text-3xl text-[#23484A] mt-1">
                  A Passion That Began With a Piece of Fabric
                </h2>
              </div>
            </div>

            <p>
              My love for fashion began long before I ever imagined turning it
              into a brand.
            </p>

            <p>
              From a very young age, I was fascinated by clothes, colours,
              fabrics, and the endless possibilities of creating something
              unique. I was never someone who simply wanted to pick a
              ready-made outfit and wear it. Instead, I loved collecting
              fabrics, imagining designs, experimenting with different styles,
              and bringing those ideas to life with the help of skilled
              tailors.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 py-3">

              <div className="bg-[#F8F5EF] p-4 md:p-6 text-center space-y-2 md:space-y-3">
                <div className="w-9 h-9 md:w-11 md:h-11 mx-auto rounded-full bg-white flex items-center justify-center text-[#C7A66A] text-base md:text-xl">
                  ✧
                </div>

                <h3 className="font-serif text-sm md:text-lg text-[#23484A] whitespace-nowrap">
                  Creativity
                </h3>

                <p className="text-xs leading-relaxed text-[#6F7775]">
                  Imagining unique designs and bringing beautiful ideas to
                  life.
                </p>
              </div>

              <div className="bg-[#F8F5EF] p-4 md:p-6 text-center space-y-2 md:space-y-3">
                <div className="w-9 h-9 md:w-11 md:h-11 mx-auto rounded-full bg-white flex items-center justify-center text-[#C7A66A] text-base md:text-xl">
                  ♡
                </div>

                <h3 className="font-serif text-sm md:text-lg text-[#23484A] whitespace-nowrap">
                  Passion
                </h3>

                <p className="text-xs leading-relaxed text-[#6F7775]">
                  A lifelong love for fabrics, fashion, and individuality.
                </p>
              </div>

              <div className="bg-[#F8F5EF] p-4 md:p-6 text-center space-y-2 md:space-y-3 col-span-2 md:col-span-1">
                <div className="w-9 h-9 md:w-11 md:h-11 mx-auto rounded-full bg-white flex items-center justify-center text-[#C7A66A] text-base md:text-xl">
                  ✿
                </div>

                <h3 className="font-serif text-sm md:text-lg text-[#23484A] whitespace-nowrap">
                  Craftsmanship
                </h3>

                <p className="text-xs leading-relaxed text-[#6F7775]">
                  Thoughtfully created pieces with care in every detail.
                </p>
              </div>

            </div>

            <p>
              What started as a childhood passion slowly became a part of who
              I am.
            </p>

            <p>
              Over the years, fashion became more than just an interest — it
              became my creative space, a way to express my personality, and
              something I genuinely loved doing. I would often design outfits
              for myself and my daughters, explore new fabrics, and turn
              simple pieces of material into something that felt completely
              personal.
            </p>

            {/* Quote */}
            <div className="relative overflow-hidden bg-[#23484A] p-5 md:p-10 text-white">
            
              <div className="relative z-10 flex gap-4 items-start">
                <div className="text-[#C7A66A] text-2xl mt-1">
                  ✦
                </div>

                <p className="font-serif text-base md:text-xl lg:text-2xl leading-relaxed">
                  Fashion became more than just something I wore. It became a
                  way to create, express, and tell my own story.
                </p>
              </div>
            </div>

            <p>
              As I shared this passion with my friends and family, they began
              encouraging me to take it a step further. “Why not turn your
              passion into something of your own?” they would ask.
            </p>

            <p className="font-serif text-base md:text-xl text-[#23484A]">
              That question stayed with me.
            </p>

            <p>
              And eventually, I decided to take that leap — transforming a
              passion I had carried since childhood into an online boutique
              built around creativity, individuality, and a genuine love for
              fashion.
            </p>

            {/* Philosophy */}
            <div className="border-t border-[#E5E0D8] pt-8 space-y-5">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F8F5EF] flex items-center justify-center text-[#C7A66A] text-lg">
                  ✦
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7A66A] font-semibold">
                    What We Believe
                  </span>

                  <h3 className="font-serif text-lg md:text-2xl text-[#23484A]">
                    The Fabstory Philosophy
                  </h3>
                </div>
              </div>

              <p>
                Today, every piece we create carries a little part of that
                journey. From choosing the fabric to shaping the design, every
                detail is thoughtfully considered with the belief that fashion
                should feel personal, beautiful, and uniquely yours.
              </p>

              <p>
                What began as a childhood love for creating clothes has now
                become a dream I get to share with you.
              </p>

            </div>

            {/* Final Message */}
            <div className="text-center pt-5 border-t border-[#E5E0D8]">

              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="w-10 h-px bg-[#C7A66A]" />
                <span className="text-[#C7A66A] text-lg">✦</span>
                <span className="w-10 h-px bg-[#C7A66A]" />
              </div>

              <p className="font-serif text-base md:text-xl lg:text-2xl text-[#23484A]">
                &quot;Sewing fabulous stories, one outfit at a time.&quot;
              </p>

            </div>

          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}