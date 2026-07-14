import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'meta-tags');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="meta-tags">
            <Client />
        </ToolPageWrapper>
    );
}
