import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('api', 'request-tester');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="api" slug="request-tester">
            <Client />
        </ToolPageWrapper>
    );
}
