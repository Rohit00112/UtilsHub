import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'watermark-remover');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="watermark-remover">
            <Client />
        </ToolPageWrapper>
    );
}
