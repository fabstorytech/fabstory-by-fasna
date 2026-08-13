import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
              MY ACCOUNT
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
              Welcome, Ayesha Khan
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/track-order" className="bg-white p-6 border border-[#E5E0D8] space-y-3 hover:border-[#23484A] transition-colors">
              <Package className="w-8 h-8 text-[#23484A]" />
              <h3 className="font-serif text-xl text-[#23484A]">My Orders</h3>
              <p className="text-xs text-[#6F7775]">View recent orders, order history, and live tracking status.</p>
            </Link>

            <Link href="/account" className="bg-white p-6 border border-[#E5E0D8] space-y-3 hover:border-[#23484A] transition-colors">
              <MapPin className="w-8 h-8 text-[#23484A]" />
              <h3 className="font-serif text-xl text-[#23484A]">Saved Addresses</h3>
              <p className="text-xs text-[#6F7775]">Manage your default shipping address and contacts.</p>
            </Link>

            <Link href="/shop" className="bg-white p-6 border border-[#E5E0D8] space-y-3 hover:border-[#23484A] transition-colors">
              <Heart className="w-8 h-8 text-[#23484A]" />
              <h3 className="font-serif text-xl text-[#23484A]">Wishlist</h3>
              <p className="text-xs text-[#6F7775]">View saved outfits and fabric designs for later.</p>
            </Link>
          </div>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
