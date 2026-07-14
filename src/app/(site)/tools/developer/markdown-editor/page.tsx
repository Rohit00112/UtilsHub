import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'markdown-editor');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="markdown-editor">
            <Client />
        </ToolPageWrapper>
    );
}
