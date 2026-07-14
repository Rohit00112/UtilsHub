import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'xml-formatter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="xml-formatter">
            <Client />
        </ToolPageWrapper>
    );
}
