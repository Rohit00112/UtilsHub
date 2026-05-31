import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'sitemap-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="sitemap-generator">
            <Client />
        </ToolPageWrapper>
    );
}
