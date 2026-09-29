'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { BRAND } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/admin');
      } else {
        setChecking(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C7A66A]/60 bg-white p-1 shadow-md animate-pulse">
            <Image src="/logo.png" alt={BRAND.fullName} fill className="object-contain p-0.5" priority />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#1C3F3A]" />
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#6F7775] font-semibold">
            Checking Admin Session...
          </p>
        </div>
      </div>
    );
  }

  return <AdminLoginForm redirectUrl="/admin" />;
}
