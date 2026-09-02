import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'image-to-base64');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="image-to-base64">
            <Client />
        </ToolPageWrapper>
    );
}
