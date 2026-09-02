import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'text-to-binary');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="text-to-binary">
            <Client />
        </ToolPageWrapper>
    );
}
