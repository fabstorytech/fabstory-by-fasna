'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import UserProfileView from '@/components/account/UserProfileView';
import { supabase } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'overview' | 'orders' | 'addresses' | 'measurements' | 'wishlist' | null;

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Single check for current session/user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingUser(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTimeout(() => {
        router.push('/account/login');
      }, 500);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <UserProfileView
      user={user}
      loadingUser={loadingUser}
      onLogout={handleLogout}
      initialTab={tabParam || 'overview'}
    />
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      <Header />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="p-16 text-center bg-white rounded-xl border border-[#E5E0D8] space-y-4">
                <div className="w-10 h-10 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#6F7775]">Loading your account & atelier profile...</p>
              </div>
            }
          >
            <AccountContent />
          </Suspense>
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
