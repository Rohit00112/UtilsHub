import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'json-schema-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="json-schema-generator">
            <Client />
        </ToolPageWrapper>
    );
}
