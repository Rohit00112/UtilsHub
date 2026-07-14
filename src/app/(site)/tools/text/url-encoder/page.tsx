import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'url-encoder');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="url-encoder">
            <Client />
        </ToolPageWrapper>
    );
}
