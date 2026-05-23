import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'remove-duplicate-lines');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="remove-duplicate-lines">
            <Client />
        </ToolPageWrapper>
    );
}
