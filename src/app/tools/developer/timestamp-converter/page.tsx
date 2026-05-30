import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'timestamp-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="timestamp-converter">
            <Client />
        </ToolPageWrapper>
    );
}
