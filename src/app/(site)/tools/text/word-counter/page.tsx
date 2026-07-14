import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'word-counter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="word-counter">
            <Client />
        </ToolPageWrapper>
    );
}
