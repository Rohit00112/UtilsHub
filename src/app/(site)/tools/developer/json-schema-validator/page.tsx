import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'json-schema-validator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="json-schema-validator">
            <Client />
        </ToolPageWrapper>
    );
}
