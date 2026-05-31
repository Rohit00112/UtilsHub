import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'slug-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="text" slug="slug-generator">
            <Client />
        </ToolPageWrapper>
    );
}
