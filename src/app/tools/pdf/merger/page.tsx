import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('pdf', 'merger');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="pdf" slug="merger">
            <Client />
        </ToolPageWrapper>
    );
}
