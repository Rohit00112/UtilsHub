import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'mime-type-lookup');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="mime-type-lookup">
            <Client />
        </ToolPageWrapper>
    );
}
