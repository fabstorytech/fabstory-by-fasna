import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/supabase/services';
import { getProductPageUrl } from '@/lib/constants';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Details | Fabstory by Fasna',
      description: 'Bespoke tailoring and curated fashion for women.',
    };
  }

  const firstImg = product.images?.[0]?.url || '/images/placeholder.jpg';
  const ogImage = firstImg.startsWith('http')
    ? firstImg
    : `https://res.cloudinary.com/jwter84c/image/upload/v1740000000/fabstory-products/placeholder.jpg`;

  return {
    title: `${product.name} | Fabstory by Fasna`,
    description:
      product.description ||
      product.shortDescription ||
      'Bespoke tailoring and curated fashion by Fasna.',
    openGraph: {
      title: `${product.name} | Fabstory by Fasna`,
      description: `Price: ₹${product.price.toLocaleString('en-IN')} • Bespoke tailoring & custom fit available.`,
      url: getProductPageUrl(product.slug),
      siteName: 'Fabstory by Fasna',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Fabstory by Fasna`,
      description:
        product.shortDescription || product.description || 'Bespoke tailoring by Fasna.',
      images: [ogImage],
    },
  };
}

export default function ProductLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
