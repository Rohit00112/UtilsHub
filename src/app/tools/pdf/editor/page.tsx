import { notFound } from 'next/navigation';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
    title: 'Tool unavailable',
    path: '/tools/pdf/editor',
});

export default function Page() {
    notFound();
}
