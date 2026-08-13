import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import BrandPromises from '@/components/home/BrandPromises';
import ShopByCategory from '@/components/home/ShopByCategory';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import TheFabstory from '@/components/home/TheFabstory';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />
      <main className="flex-1">
        <Hero />
        <BrandPromises />
        <ShopByCategory />
        <FeaturedCollection />
        <TheFabstory />
      </main>
      <Footer />
    </div>
  );
}
