import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'html-entities');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="html-entities">
            <Client />
        </ToolPageWrapper>
    );
}
