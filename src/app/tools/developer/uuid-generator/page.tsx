import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'uuid-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="uuid-generator">
            <Client />
        </ToolPageWrapper>
    );
}
