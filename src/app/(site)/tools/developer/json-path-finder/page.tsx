import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'json-path-finder');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="json-path-finder">
            <Client />
        </ToolPageWrapper>
    );
}
