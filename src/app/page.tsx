import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import BrandPromises from '@/components/home/BrandPromises';
import ShopByCategory from '@/components/home/ShopByCategory';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import TheFabstory from '@/components/home/TheFabstory';
import { getSiteSettings } from '@/lib/supabase/services';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />
      <main className="flex-1">
        <Hero initialSettings={siteSettings} />
        <BrandPromises />
        <ShopByCategory />
        <FeaturedCollection />
        <TheFabstory />
      </main>
      <Footer />
    </div>
  );
}

