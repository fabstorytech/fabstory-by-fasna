import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 flex items-center justify-center section-padding text-center">
        <div className="container-narrow space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
            404 — PAGE NOT FOUND
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#23484A]">
            Looks like this story hasn&apos;t been stitched yet.
          </h1>
          <p className="text-xs md:text-sm text-[#6F7775] max-w-md mx-auto">
            The page you are looking for might have been moved, renamed, or is under custom creation.
          </p>
          <div>
            <Link
              href="/"
              className="btn btn-primary bg-[#23484A] text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider inline-block"
            >
              RETURN HOME
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
