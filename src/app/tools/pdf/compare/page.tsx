import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('pdf', 'compare');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="pdf" slug="compare">
            <Client />
        </ToolPageWrapper>
    );
}
