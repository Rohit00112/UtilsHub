import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'favicon-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="favicon-generator">
            <Client />
        </ToolPageWrapper>
    );
}
