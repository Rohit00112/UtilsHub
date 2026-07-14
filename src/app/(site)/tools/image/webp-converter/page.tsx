import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'webp-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="webp-converter">
            <Client />
        </ToolPageWrapper>
    );
}
