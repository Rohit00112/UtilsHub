import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'metadata-remover');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="metadata-remover">
            <Client />
        </ToolPageWrapper>
    );
}
