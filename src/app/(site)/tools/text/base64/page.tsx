import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'base64');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="base64">
            <Client />
        </ToolPageWrapper>
    );
}
