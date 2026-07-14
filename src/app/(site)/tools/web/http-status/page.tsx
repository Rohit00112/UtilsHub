import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'http-status');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="http-status">
            <Client />
        </ToolPageWrapper>
    );
}
