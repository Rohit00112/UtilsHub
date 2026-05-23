import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'case-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="case-converter">
            <Client />
        </ToolPageWrapper>
    );
}
