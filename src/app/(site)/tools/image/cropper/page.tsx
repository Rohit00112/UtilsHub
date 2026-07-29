import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'cropper');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="cropper">
            <Client />
        </ToolPageWrapper>
    );
}
