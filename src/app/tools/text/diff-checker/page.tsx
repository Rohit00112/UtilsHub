import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'diff-checker');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="diff-checker">
            <Client />
        </ToolPageWrapper>
    );
}
