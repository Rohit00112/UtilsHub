import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('api', 'websocket-tester');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="api" slug="websocket-tester">
            <Client />
        </ToolPageWrapper>
    );
}
