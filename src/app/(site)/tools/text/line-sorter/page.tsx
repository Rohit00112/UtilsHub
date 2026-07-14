import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'line-sorter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="line-sorter">
            <Client />
        </ToolPageWrapper>
    );
}
