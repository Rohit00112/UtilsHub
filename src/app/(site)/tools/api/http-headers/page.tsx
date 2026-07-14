import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('api', 'http-headers');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="api" slug="http-headers">
            <Client />
        </ToolPageWrapper>
    );
}
